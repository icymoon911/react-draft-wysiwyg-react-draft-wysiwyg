import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { RichUtils, EditorState, Modifier } from 'draft-js';
import { getSelectionInlineStyle } from 'draftjs-utils';

import LayoutComponent from './Component';
import { useExpandCollapse } from '../../utils/hooks';

const Inline = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const changeKeys = (style) => {
    if (style) {
      const st = {};
      Object.keys(style).forEach((key) => {
        st[key === 'CODE' ? 'monospace' : key.toLowerCase()] = style[key];
      });
      return st;
    }
    return undefined;
  };

  const currentStyles = editorState
    ? changeKeys(getSelectionInlineStyle(editorState))
    : {};

  const toggleInlineStyle = useCallback((style) => {
    const newStyle = style === 'monospace' ? 'CODE' : style.toUpperCase();
    let newState = RichUtils.toggleInlineStyle(editorState, newStyle);
    if (style === 'subscript' || style === 'superscript') {
      const removeStyle = style === 'subscript' ? 'SUPERSCRIPT' : 'SUBSCRIPT';
      const contentState = Modifier.removeInlineStyle(
        newState.getCurrentContent(),
        newState.getSelection(),
        removeStyle
      );
      newState = EditorState.push(
        newState,
        contentState,
        'change-inline-style'
      );
    }
    if (newState) {
      onChange(newState);
    }
  }, [editorState, onChange]);

  const InlineComponent = config.component || LayoutComponent;
  return (
    <InlineComponent
      config={config}
      translations={translations}
      currentState={currentStyles}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
      onChange={toggleInlineStyle}
    />
  );
};

Inline.propTypes = {
  onChange: PropTypes.func.isRequired,
  editorState: PropTypes.object.isRequired,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default Inline;
