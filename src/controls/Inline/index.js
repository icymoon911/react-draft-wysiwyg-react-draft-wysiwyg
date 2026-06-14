import React from 'react';
import PropTypes from 'prop-types';
import { getSelectionInlineStyle } from 'draftjs-utils';
import { RichUtils, EditorState, Modifier } from 'draft-js';
import { forEach } from '../../utils/common';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import useEditorStateSync from '../../hooks/useEditorStateSync';
import LayoutComponent from './Component';

const changeKeys = (style) => {
  if (style) {
    const st = {};
    forEach(style, (key, value) => {
      st[key === 'CODE' ? 'monospace' : key.toLowerCase()] = value;
    });
    return st;
  }
  return undefined;
};

const Inline = ({ onChange, editorState, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentStyles = useEditorStateSync(
    editorState,
    (es) => changeKeys(getSelectionInlineStyle(es)),
    {}
  );

  const toggleInlineStyle = (style) => {
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
  };

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
