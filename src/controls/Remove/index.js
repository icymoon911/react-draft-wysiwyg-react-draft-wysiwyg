import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { EditorState, Modifier } from 'draft-js';
import { getSelectionCustomInlineStyle } from 'draftjs-utils';

import LayoutComponent from './Component';
import { useExpandCollapse } from '../../utils/hooks';

const Remove = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const removeAllInlineStyles = useCallback((es) => {
    let contentState = es.getCurrentContent();
    [
      'BOLD',
      'ITALIC',
      'UNDERLINE',
      'STRIKETHROUGH',
      'MONOSPACE',
      'SUPERSCRIPT',
      'SUBSCRIPT',
    ].forEach(style => {
      contentState = Modifier.removeInlineStyle(
        contentState,
        es.getSelection(),
        style
      );
    });
    const customStyles = getSelectionCustomInlineStyle(es, [
      'FONTSIZE',
      'FONTFAMILY',
      'COLOR',
      'BGCOLOR',
    ]);
    Object.keys(customStyles).forEach((key) => {
      const value = customStyles[key];
      if (value) {
        contentState = Modifier.removeInlineStyle(
          contentState,
          es.getSelection(),
          value
        );
      }
    });

    return EditorState.push(es, contentState, 'change-inline-style');
  }, []);

  const removeInlineStyles = useCallback(() => {
    onChange(removeAllInlineStyles(editorState));
  }, [editorState, onChange, removeAllInlineStyles]);

  const RemoveComponent = config.component || LayoutComponent;
  return (
    <RemoveComponent
      config={config}
      translations={translations}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
      onChange={removeInlineStyles}
    />
  );
};

Remove.propTypes = {
  onChange: PropTypes.func.isRequired,
  editorState: PropTypes.object.isRequired,
  config: PropTypes.object,
  translations: PropTypes.object,
  modalHandler: PropTypes.object,
};

export default Remove;
