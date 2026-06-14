import React from 'react';
import PropTypes from 'prop-types';
import { Modifier, EditorState } from 'draft-js';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import LayoutComponent from './Component';

const Emoji = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const addEmoji = (emoji) => {
    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      emoji,
      editorState.getCurrentInlineStyle()
    );
    onChange(EditorState.push(editorState, contentState, 'insert-characters'));
    doCollapse();
  };

  const EmojiComponent = config.component || LayoutComponent;
  return (
    <EmojiComponent
      config={config}
      translations={translations}
      onChange={addEmoji}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
    />
  );
};

Emoji.propTypes = {
  editorState: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default Emoji;
