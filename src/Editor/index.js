import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  getDefaultKeyBinding,
} from 'draft-js';
import {
  changeDepth,
  handleNewLine,
  blockRenderMap,
  getCustomStyleMap,
  extractInlineStyle,
  getSelectedBlocksType,
} from 'draftjs-utils';
import classNames from 'classnames';
import ModalHandler from '../event-handler/modals';
import FocusHandler from '../event-handler/focus';
import KeyDownHandler from '../event-handler/keyDown';
import SuggestionHandler from '../event-handler/suggestions';
import blockStyleFn from '../utils/BlockStyle';
import { mergeRecursive } from '../utils/toolbar';
import { hasProperty, filter } from '../utils/common';
import { handlePastedText } from '../utils/handlePaste';
import Controls from '../controls';
import getLinkDecorator from '../decorators/Link';
import getMentionDecorators from '../decorators/Mention';
import getHashtagDecorator from '../decorators/HashTag';
import getBlockRenderFunc from '../renderer';
import defaultToolbar from '../config/defaultToolbar';
import localeTranslations from '../i18n';
import './styles.css';
import '../../css/Draft.css';

const filterEditorProps = (props) =>
  filter(props, [
    'onChange',
    'onEditorStateChange',
    'onContentStateChange',
    'initialContentState',
    'defaultContentState',
    'contentState',
    'editorState',
    'defaultEditorState',
    'locale',
    'localization',
    'toolbarOnFocus',
    'toolbar',
    'toolbarCustomButtons',
    'toolbarClassName',
    'editorClassName',
    'toolbarHidden',
    'wrapperClassName',
    'toolbarStyle',
    'editorStyle',
    'wrapperStyle',
    'uploadCallback',
    'onFocus',
    'onBlur',
    'onTab',
    'mention',
    'hashtag',
    'ariaLabel',
    'customBlockRenderFunc',
    'customDecorators',
    'handlePastedText',
    'customStyleMap',
  ]);

const WysiwygEditor = (props) => {
  const {
    locale,
    localization,
    toolbar: toolbarProp,
    toolbarCustomButtons,
    toolbarOnFocus,
    toolbarClassName,
    toolbarHidden,
    editorClassName,
    wrapperClassName,
    toolbarStyle,
    editorStyle,
    wrapperStyle,
    uploadCallback,
    onFocus,
    onBlur,
    onTab,
    mention,
    hashtag,
    ariaLabel,
    readOnly,
    editorState: editorStateProp,
    contentState: contentStateProp,
    defaultEditorState,
    customDecorators,
    customBlockRenderFunc,
    customStyleMap: customStyleMapProp,
    editorRef: editorRefProp,
    wrapperId: wrapperIdProp,
    onEditorStateChange,
    onContentStateChange,
    onChange: onChangeProp,
    stripPastedStyles,
    handlePastedText: handlePastedTextProp,
  } = props;

  // Stable refs for instances
  const modalHandlerRef = useRef(new ModalHandler());
  const focusHandlerRef = useRef(new FocusHandler());
  const wrapperRef = useRef(null);
  const editorRef = useRef(null);
  const editorStateRef = useRef(null);

  const modalHandler = modalHandlerRef.current;
  const focusHandler = focusHandlerRef.current;

  // Compute wrapperId once
  const wrapperId = useMemo(() => {
    const id = wrapperIdProp || Math.floor(Math.random() * 10000);
    return `rdw-wrapper-${id}`;
  }, [wrapperIdProp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute toolbar once
  const initialToolbar = useMemo(
    () => mergeRecursive(defaultToolbar, toolbarProp),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Build composite decorator
  const compositeDecorator = useMemo(() => {
    const decorators = [
      ...customDecorators,
      getLinkDecorator({
        showOpenOptionOnHover: initialToolbar.link.showOpenOptionOnHover,
      }),
    ];
    if (mention) {
      decorators.push(
        ...getMentionDecorators({
          ...mention,
          onChange: (es) => editorStateRef.current = es,
          getEditorState: () => editorStateRef.current,
          getSuggestions: () => props.mention && props.mention.suggestions,
          getWrapperRef: () => wrapperRef.current,
          modalHandler,
        })
      );
    }
    if (hashtag) {
      decorators.push(getHashtagDecorator(hashtag));
    }
    return new CompositeDecorator(decorators);
  }, [customDecorators, mention, hashtag, initialToolbar.link.showOpenOptionOnHover, modalHandler, props.mention]);

  // Create initial editor state
  const [editorState, setEditorState] = useState(() => {
    let es;
    if (hasProperty(props, 'editorState')) {
      if (editorStateProp) {
        es = EditorState.set(editorStateProp, { decorator: compositeDecorator });
      }
    } else if (hasProperty(props, 'defaultEditorState')) {
      if (defaultEditorState) {
        es = EditorState.set(defaultEditorState, { decorator: compositeDecorator });
      }
    } else if (hasProperty(props, 'contentState')) {
      if (props.contentState) {
        const cs = convertFromRaw(props.contentState);
        es = EditorState.createWithContent(cs, compositeDecorator);
        es = EditorState.moveSelectionToEnd(es);
      }
    } else if (
      hasProperty(props, 'defaultContentState') ||
      hasProperty(props, 'initialContentState')
    ) {
      let cs = props.defaultContentState || props.initialContentState;
      if (cs) {
        cs = convertFromRaw(cs);
        es = EditorState.createWithContent(cs, compositeDecorator);
        es = EditorState.moveSelectionToEnd(es);
      }
    }
    if (!es) {
      es = EditorState.createEmpty(compositeDecorator);
    }
    extractInlineStyle(es);
    return es;
  });

  // Keep editorStateRef in sync
  editorStateRef.current = editorState;

  // State
  const [editorFocused, setEditorFocused] = useState(false);
  const [toolbar, setToolbar] = useState(initialToolbar);

  // Init modal handler on mount
  useEffect(() => {
    modalHandler.init(wrapperId);
  }, [modalHandler, wrapperId]);

  // Sync editorState from props
  useEffect(() => {
    if (
      hasProperty(props, 'editorState') &&
      editorStateProp !== undefined
    ) {
      const newEs = editorStateProp
        ? EditorState.set(editorStateProp, { decorator: compositeDecorator })
        : EditorState.createEmpty(compositeDecorator);
      setEditorState(newEs);
      extractInlineStyle(newEs);
    }
  }, [editorStateProp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync contentState from props
  useEffect(() => {
    if (
      hasProperty(props, 'contentState') &&
      contentStateProp !== undefined &&
      !hasProperty(props, 'editorState')
    ) {
      if (contentStateProp) {
        const newContentState = convertFromRaw(contentStateProp);
        let newEs = EditorState.push(
          editorStateRef.current,
          newContentState,
          'insert-characters'
        );
        newEs = EditorState.moveSelectionToEnd(newEs);
        setEditorState(newEs);
        extractInlineStyle(newEs);
      } else {
        const newEs = EditorState.createEmpty(compositeDecorator);
        setEditorState(newEs);
        extractInlineStyle(newEs);
      }
    }
  }, [contentStateProp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Callbacks
  const getEditorState = useCallback(() => editorStateRef.current, []);

  const afterChange = useCallback((es) => {
    setTimeout(() => {
      if (onChangeProp) {
        onChangeProp(convertToRaw(es.getCurrentContent()));
      }
      if (onContentStateChange) {
        onContentStateChange(convertToRaw(es.getCurrentContent()));
      }
    });
  }, [onChangeProp, onContentStateChange]);

  const onChange = useCallback((es) => {
    if (
      !readOnly &&
      !(
        getSelectedBlocksType(es) === 'atomic' &&
        es.getSelection().isCollapsed
      )
    ) {
      if (onEditorStateChange) {
        onEditorStateChange(es, props.wrapperId);
      }
      if (!hasProperty(props, 'editorState')) {
        setEditorState(es);
        afterChange(es);
      } else {
        afterChange(es);
      }
    }
  }, [readOnly, onEditorStateChange, props, afterChange]);

  const onEditorBlur = useCallback(() => {
    setEditorFocused(false);
  }, []);

  const onEditorFocus = useCallback((event) => {
    setEditorFocused(true);
    const editFocused = focusHandler.isEditorFocused();
    if (onFocus && editFocused) {
      onFocus(event);
    }
  }, [onFocus, focusHandler]);

  const onEditorMouseDown = useCallback(() => {
    focusHandler.onEditorMouseDown();
  }, [focusHandler]);

  const keyBindingFn = useCallback((event) => {
    if (event.key === 'Tab') {
      if (!onTab || !onTab(event)) {
        const newEs = changeDepth(
          editorStateRef.current,
          event.shiftKey ? -1 : 1,
          4
        );
        if (newEs && newEs !== editorStateRef.current) {
          onChange(newEs);
          event.preventDefault();
        }
      }
      return null;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (SuggestionHandler.isOpen()) {
        event.preventDefault();
      }
    }
    return getDefaultKeyBinding(event);
  }, [onTab, onChange]);

  const onToolbarFocus = useCallback((event) => {
    if (onFocus && focusHandler.isToolbarFocused()) {
      onFocus(event);
    }
  }, [onFocus, focusHandler]);

  const onWrapperBlur = useCallback((event) => {
    if (onBlur && focusHandler.isEditorBlur(event)) {
      onBlur(event, getEditorState());
    }
  }, [onBlur, focusHandler, getEditorState]);

  const handleKeyCommand = useCallback((command) => {
    const currentEs = editorStateRef.current;
    const inline = toolbar?.inline;
    if (inline && inline.options.indexOf(command) >= 0) {
      const newState = RichUtils.handleKeyCommand(currentEs, command);
      if (newState) {
        onChange(newState);
        return true;
      }
    }
    return false;
  }, [onChange, toolbar]);

  const handleReturn = useCallback((event) => {
    if (SuggestionHandler.isOpen()) {
      return true;
    }
    const currentEs = editorStateRef.current;
    const newEditorState = handleNewLine(currentEs, event);
    if (newEditorState) {
      onChange(newEditorState);
      return true;
    }
    return false;
  }, [onChange]);

  const handlePastedTextFn = useCallback((text, html) => {
    const currentEs = editorStateRef.current;
    if (handlePastedTextProp) {
      return handlePastedTextProp(text, html, currentEs, onChange);
    }
    if (!stripPastedStyles) {
      return handlePastedText(text, html, currentEs, onChange);
    }
    return false;
  }, [handlePastedTextProp, stripPastedStyles, onChange]);

  const preventDefault = useCallback((event) => {
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'LABEL' ||
      event.target.tagName === 'TEXTAREA'
    ) {
      focusHandler.onInputMouseDown();
    } else {
      event.preventDefault();
    }
  }, [focusHandler]);

  const focusEditor = useCallback(() => {
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    });
  }, []);

  const setWrapperReference = useCallback((ref) => {
    wrapperRef.current = ref;
  }, []);

  const setEditorReference = useCallback((ref) => {
    if (editorRefProp) {
      editorRefProp(ref);
    }
    editorRef.current = ref;
  }, [editorRefProp]);

  // Computed values
  const isReadOnly = useCallback(() => readOnly, [readOnly]);

  const isImageAlignmentEnabled = useCallback(
    () => toolbar.image.alignmentEnabled,
    [toolbar]
  );

  const blockRendererFn = useMemo(
    () =>
      getBlockRenderFunc(
        {
          isReadOnly,
          isImageAlignmentEnabled,
          getEditorState,
          onChange,
        },
        customBlockRenderFunc
      ),
    [isReadOnly, isImageAlignmentEnabled, getEditorState, onChange, customBlockRenderFunc]
  );

  const editorProps = useMemo(() => filterEditorProps(props), [props]);

  const currentCustomStyleMap = useMemo(
    () => ({
      ...getCustomStyleMap(),
      ...customStyleMapProp,
    }),
    [customStyleMapProp]
  );

  // Build control props and render
  const controlProps = {
    modalHandler,
    editorState,
    onChange,
    translations: {
      ...localeTranslations[locale || localization.locale],
      ...localization.translations,
    },
  };

  const toolbarShow =
    editorFocused || focusHandler.isInputFocused() || !toolbarOnFocus;

  return (
    <div
      id={wrapperId}
      className={classNames(wrapperClassName, 'rdw-editor-wrapper')}
      style={wrapperStyle}
      onClick={modalHandler.onEditorClick}
      onBlur={onWrapperBlur}
      aria-label="rdw-wrapper"
    >
      {!toolbarHidden && (
        <div
          className={classNames('rdw-editor-toolbar', toolbarClassName)}
          style={{
            visibility: toolbarShow ? 'visible' : 'hidden',
            ...toolbarStyle,
          }}
          onMouseDown={preventDefault}
          aria-label="rdw-toolbar"
          aria-hidden={(!editorFocused && toolbarOnFocus).toString()}
          onFocus={onToolbarFocus}
        >
          {toolbar.options.map((opt, index) => {
            const Control = Controls[opt];
            const config = { ...toolbar[opt] };
            if (opt === 'image' && uploadCallback) {
              config.uploadCallback = uploadCallback;
            }
            return <Control key={index} {...controlProps} config={config} />;
          })}
          {toolbarCustomButtons &&
            toolbarCustomButtons.map((button, index) =>
              React.cloneElement(button, { key: index, ...controlProps })
            )}
        </div>
      )}
      <div
        ref={setWrapperReference}
        className={classNames(editorClassName, 'rdw-editor-main')}
        style={editorStyle}
        onClick={focusEditor}
        onFocus={onEditorFocus}
        onBlur={onEditorBlur}
        onKeyDown={KeyDownHandler.onKeyDown}
        onMouseDown={onEditorMouseDown}
      >
        <Editor
          ref={setEditorReference}
          keyBindingFn={keyBindingFn}
          editorState={editorState}
          onChange={onChange}
          blockStyleFn={blockStyleFn}
          customStyleMap={currentCustomStyleMap}
          handleReturn={handleReturn}
          handlePastedText={handlePastedTextFn}
          blockRendererFn={blockRendererFn}
          handleKeyCommand={handleKeyCommand}
          ariaLabel={ariaLabel || 'rdw-editor'}
          blockRenderMap={blockRenderMap}
          {...editorProps}
        />
      </div>
    </div>
  );
};

WysiwygEditor.propTypes = {
  onChange: PropTypes.func,
  onEditorStateChange: PropTypes.func,
  onContentStateChange: PropTypes.func,
  // initialContentState is deprecated
  initialContentState: PropTypes.object,
  defaultContentState: PropTypes.object,
  contentState: PropTypes.object,
  editorState: PropTypes.object,
  defaultEditorState: PropTypes.object,
  toolbarOnFocus: PropTypes.bool,
  spellCheck: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  stripPastedStyles: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  toolbar: PropTypes.object,
  toolbarCustomButtons: PropTypes.array,
  toolbarClassName: PropTypes.string,
  toolbarHidden: PropTypes.bool,
  locale: PropTypes.string,
  localization: PropTypes.object,
  editorClassName: PropTypes.string,
  wrapperClassName: PropTypes.string,
  toolbarStyle: PropTypes.object,
  editorStyle: PropTypes.object,
  wrapperStyle: PropTypes.object,
  uploadCallback: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onTab: PropTypes.func,
  mention: PropTypes.object,
  hashtag: PropTypes.object,
  textAlignment: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  readOnly: PropTypes.bool,
  tabIndex: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
  placeholder: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  ariaLabel: PropTypes.string,
  ariaOwneeID: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  ariaActiveDescendantID: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  ariaAutoComplete: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  ariaDescribedBy: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  ariaExpanded: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  ariaHasPopup: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  customBlockRenderFunc: PropTypes.func,
  wrapperId: PropTypes.number,
  customDecorators: PropTypes.array,
  editorRef: PropTypes.func,
  handlePastedText: PropTypes.func,
};

WysiwygEditor.defaultProps = {
  toolbarOnFocus: false,
  toolbarHidden: false,
  stripPastedStyles: false,
  localization: { locale: 'en', translations: {} },
  customDecorators: [],
};

export default WysiwygEditor;
