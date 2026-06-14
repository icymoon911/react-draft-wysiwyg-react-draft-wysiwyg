import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  getDefaultKeyBinding,
} from "draft-js";
import {
  changeDepth,
  handleNewLine,
  blockRenderMap,
  getCustomStyleMap,
  extractInlineStyle,
  getSelectedBlocksType,
} from "draftjs-utils";
import classNames from "classnames";
import ModalHandler from "../event-handler/modals";
import FocusHandler from "../event-handler/focus";
import KeyDownHandler from "../event-handler/keyDown";
import SuggestionHandler from "../event-handler/suggestions";
import blockStyleFn from "../utils/BlockStyle";
import { mergeRecursive } from "../utils/toolbar";
import { hasProperty, filter } from "../utils/common";
import { handlePastedText } from "../utils/handlePaste";
import Controls from "../controls";
import getLinkDecorator from "../decorators/Link";
import getMentionDecorators from "../decorators/Mention";
import getHashtagDecorator from "../decorators/HashTag";
import getBlockRenderFunc from "../renderer";
import defaultToolbar from "../config/defaultToolbar";
import localeTranslations from "../i18n";
import "./styles.css";
import "../../css/Draft.css";

const WysiwygEditor = (props) => {
  const {
    onChange,
    onEditorStateChange,
    onContentStateChange,
    initialContentState,
    defaultContentState,
    contentState,
    editorState: editorStateProp,
    defaultEditorState,
    toolbarOnFocus,
    stripPastedStyles,
    toolbar: toolbarProp,
    toolbarCustomButtons,
    toolbarClassName,
    toolbarHidden,
    locale,
    localization: { locale: newLocale, translations },
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
    readOnly,
    ariaLabel,
    customBlockRenderFunc,
    customDecorators,
    handlePastedText: handlePastedTextProp,
    customStyleMap: customStyleMapProp,
    wrapperId: wrapperIdProp,
    editorRef: editorRefProp,
  } = props;

  // Initialize refs for handler instances and editor
  const modalHandlerRef = useRef(null);
  const focusHandlerRef = useRef(null);
  const wrapperRef = useRef(null);
  const editorRef = useRef(null);

  if (!modalHandlerRef.current) {
    modalHandlerRef.current = new ModalHandler();
  }
  if (!focusHandlerRef.current) {
    focusHandlerRef.current = new FocusHandler();
  }

  const modalHandler = modalHandlerRef.current;
  const focusHandler = focusHandlerRef.current;

  const wrapperId = useMemo(() => {
    const id = wrapperIdProp
      ? wrapperIdProp
      : Math.floor(Math.random() * 10000);
    return `rdw-wrapper-${id}`;
  }, [wrapperIdProp]);

  const toolbar = useMemo(() => mergeRecursive(defaultToolbar, toolbarProp), [toolbarProp]);

  const compositeDecorator = useMemo(() => {
    const decorators = [
      ...customDecorators,
      getLinkDecorator({
        showOpenOptionOnHover: toolbar.link.showOpenOptionOnHover,
      }),
    ];
    if (mention) {
      decorators.push(
        ...getMentionDecorators({
          ...mention,
          onChange: handleChange,
          getEditorState: () => editorStateRef.current,
          getSuggestions: () => mention && mention.suggestions,
          getWrapperRef: () => wrapperRef.current,
          modalHandler,
        })
      );
    }
    if (hashtag) {
      decorators.push(getHashtagDecorator(hashtag));
    }
    return new CompositeDecorator(decorators);
    // Note: handleChange is defined below, but used here. This is fine due to hoisting.
  }, [customDecorators, toolbar.link.showOpenOptionOnHover, mention, hashtag, modalHandler]);

  const createEditorState = useCallback((decorator) => {
    let es;
    if (hasProperty(props, "editorState")) {
      if (editorStateProp) {
        es = EditorState.set(editorStateProp, {
          decorator,
        });
      }
    } else if (hasProperty(props, "defaultEditorState")) {
      if (defaultEditorState) {
        es = EditorState.set(defaultEditorState, {
          decorator,
        });
      }
    } else if (hasProperty(props, "contentState")) {
      if (contentState) {
        const cs = convertFromRaw(contentState);
        es = EditorState.createWithContent(cs, decorator);
        es = EditorState.moveSelectionToEnd(es);
      }
    } else if (
      hasProperty(props, "defaultContentState") ||
      hasProperty(props, "initialContentState")
    ) {
      let cs = defaultContentState || initialContentState;
      if (cs) {
        cs = convertFromRaw(cs);
        es = EditorState.createWithContent(cs, decorator);
        es = EditorState.moveSelectionToEnd(es);
      }
    }
    if (!es) {
      es = EditorState.createEmpty(decorator);
    }
    return es;
  }, [props, editorStateProp, defaultEditorState, contentState, defaultContentState, initialContentState]);

  const [stateEditorState, setStateEditorState] = useState(() => {
    const es = createEditorState(compositeDecorator);
    extractInlineStyle(es);
    return es;
  });
  const [editorFocused, setEditorFocused] = useState(false);

  // Keep a ref to the current editor state for use in callbacks
  const editorStateRef = useRef(stateEditorState);
  editorStateRef.current = stateEditorState;

  const getEditorState = useCallback(() => stateEditorState, [stateEditorState]);

  const afterChange = useCallback((es) => {
    setTimeout(() => {
      if (onChange) {
        onChange(convertToRaw(es.getCurrentContent()));
      }
      if (onContentStateChange) {
        onContentStateChange(convertToRaw(es.getCurrentContent()));
      }
    });
  }, [onChange, onContentStateChange]);

  const handleChange = useCallback((es) => {
    if (
      !readOnly &&
      !(
        getSelectedBlocksType(es) === "atomic" &&
        es.getSelection().isCollapsed
      )
    ) {
      if (onEditorStateChange) {
        onEditorStateChange(es, props.wrapperId);
      }
      if (!hasProperty(props, "editorState")) {
        setStateEditorState(es);
        afterChange(es);
      } else {
        afterChange(es);
      }
    }
  }, [readOnly, onEditorStateChange, props, afterChange]);

  // Sync editorState from props
  useEffect(() => {
    if (
      hasProperty(props, "editorState") &&
      editorStateProp !== undefined
    ) {
      if (editorStateProp) {
        const newState = EditorState.set(editorStateProp, {
          decorator: compositeDecorator,
        });
        extractInlineStyle(newState);
        setStateEditorState(newState);
      } else {
        const newState = EditorState.createEmpty(compositeDecorator);
        extractInlineStyle(newState);
        setStateEditorState(newState);
      }
    } else if (
      hasProperty(props, "contentState") &&
      contentState !== undefined
    ) {
      if (contentState) {
        const newContentState = convertFromRaw(contentState);
        let newEditorState = EditorState.push(
          stateEditorState,
          newContentState,
          "insert-characters"
        );
        newEditorState = EditorState.moveSelectionToEnd(newEditorState);
        extractInlineStyle(newEditorState);
        setStateEditorState(newEditorState);
      } else {
        const newState = EditorState.createEmpty(compositeDecorator);
        extractInlineStyle(newState);
        setStateEditorState(newState);
      }
    }
  }, [editorStateProp, contentState]);

  // Initialize modal handler
  useEffect(() => {
    modalHandler.init(wrapperId);
  }, [wrapperId, modalHandler]);

  const blockRendererFn = useMemo(() => getBlockRenderFunc(
    {
      isReadOnly: () => readOnly,
      isImageAlignmentEnabled: () => toolbar.image.alignmentEnabled,
      getEditorState: () => editorStateRef.current,
      onChange: handleChange,
    },
    customBlockRenderFunc
  ), [readOnly, toolbar.image.alignmentEnabled, handleChange, customBlockRenderFunc]);

  const editorProps = useMemo(() => filter(props, [
    "onChange",
    "onEditorStateChange",
    "onContentStateChange",
    "initialContentState",
    "defaultContentState",
    "contentState",
    "editorState",
    "defaultEditorState",
    "locale",
    "localization",
    "toolbarOnFocus",
    "toolbar",
    "toolbarCustomButtons",
    "toolbarClassName",
    "editorClassName",
    "toolbarHidden",
    "wrapperClassName",
    "toolbarStyle",
    "editorStyle",
    "wrapperStyle",
    "uploadCallback",
    "onFocus",
    "onBlur",
    "onTab",
    "mention",
    "hashtag",
    "ariaLabel",
    "customBlockRenderFunc",
    "customDecorators",
    "handlePastedText",
    "customStyleMap",
  ]), [props]);

  const styleMap = useMemo(() => ({
    ...getCustomStyleMap(),
    ...customStyleMapProp,
  }), [customStyleMapProp]);

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
    if (event.key === "Tab") {
      if (!onTab || !onTab(event)) {
        const newEditorState = changeDepth(
          stateEditorState,
          event.shiftKey ? -1 : 1,
          4
        );
        if (newEditorState && newEditorState !== stateEditorState) {
          handleChange(newEditorState);
          event.preventDefault();
        }
      }
      return null;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (SuggestionHandler.isOpen()) {
        event.preventDefault();
      }
    }
    return getDefaultKeyBinding(event);
  }, [onTab, stateEditorState, handleChange]);

  const onToolbarFocus = useCallback((event) => {
    if (onFocus && focusHandler.isToolbarFocused()) {
      onFocus(event);
    }
  }, [onFocus, focusHandler]);

  const onWrapperBlur = useCallback((event) => {
    if (onBlur && focusHandler.isEditorBlur(event)) {
      onBlur(event, editorStateRef.current);
    }
  }, [onBlur, focusHandler]);

  const setWrapperReference = useCallback((ref) => {
    wrapperRef.current = ref;
  }, []);

  const setEditorReference = useCallback((ref) => {
    if (editorRefProp) {
      editorRefProp(ref);
    }
    editorRef.current = ref;
  }, [editorRefProp]);

  const focusEditor = useCallback(() => {
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    });
  }, []);

  const handleKeyCommand = useCallback((command) => {
    const { inline } = toolbar;
    if (inline && inline.options.indexOf(command) >= 0) {
      const newState = RichUtils.handleKeyCommand(stateEditorState, command);
      if (newState) {
        handleChange(newState);
        return true;
      }
    }
    return false;
  }, [toolbar, stateEditorState, handleChange]);

  const handleReturn = useCallback((event) => {
    if (SuggestionHandler.isOpen()) {
      return true;
    }
    const newEditorState = handleNewLine(stateEditorState, event);
    if (newEditorState) {
      handleChange(newEditorState);
      return true;
    }
    return false;
  }, [stateEditorState, handleChange]);

  const handlePastedTextFn = useCallback((text, html) => {
    if (handlePastedTextProp) {
      return handlePastedTextProp(text, html, stateEditorState, handleChange);
    }
    if (!stripPastedStyles) {
      return handlePastedText(text, html, stateEditorState, handleChange);
    }
    return false;
  }, [handlePastedTextProp, stripPastedStyles, stateEditorState, handleChange]);

  const preventDefault = useCallback((event) => {
    if (
      event.target.tagName === "INPUT" ||
      event.target.tagName === "LABEL" ||
      event.target.tagName === "TEXTAREA"
    ) {
      focusHandler.onInputMouseDown();
    } else {
      event.preventDefault();
    }
  }, [focusHandler]);

  const controlProps = {
    modalHandler,
    editorState: stateEditorState,
    onChange: handleChange,
    translations: {
      ...localeTranslations[locale || newLocale],
      ...translations,
    },
  };
  const toolbarShow =
    editorFocused || focusHandler.isInputFocused() || !toolbarOnFocus;

  return (
    <div
      id={wrapperId}
      className={classNames(wrapperClassName, "rdw-editor-wrapper")}
      style={wrapperStyle}
      onClick={modalHandler.onEditorClick}
      onBlur={onWrapperBlur}
      aria-label="rdw-wrapper"
    >
      {!toolbarHidden && (
        <div
          className={classNames("rdw-editor-toolbar", toolbarClassName)}
          style={{
            visibility: toolbarShow ? "visible" : "hidden",
            ...toolbarStyle,
          }}
          onMouseDown={preventDefault}
          aria-label="rdw-toolbar"
          aria-hidden={(!editorFocused && toolbarOnFocus).toString()}
          onFocus={onToolbarFocus}
        >
          {toolbar.options.map((opt, index) => {
            const Control = Controls[opt];
            const config = toolbar[opt];
            if (opt === "image" && uploadCallback) {
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
        className={classNames(editorClassName, "rdw-editor-main")}
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
          editorState={stateEditorState}
          onChange={handleChange}
          blockStyleFn={blockStyleFn}
          customStyleMap={styleMap}
          handleReturn={handleReturn}
          handlePastedText={handlePastedTextFn}
          blockRendererFn={blockRendererFn}
          handleKeyCommand={handleKeyCommand}
          ariaLabel={ariaLabel || "rdw-editor"}
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
  localization: { locale: "en", translations: {} },
  customDecorators: [],
};

export default WysiwygEditor;
