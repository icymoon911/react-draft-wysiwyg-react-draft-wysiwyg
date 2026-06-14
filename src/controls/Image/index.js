import React from 'react';
import PropTypes from 'prop-types';
import { AtomicBlockUtils } from 'draft-js';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import LayoutComponent from './Component';

const ImageControl = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const addImage = (src, height, width, alt) => {
    const entityData = { src, height, width };
    if (config.alt.present) {
      entityData.alt = alt;
    }
    const entityKey = editorState
      .getCurrentContent()
      .createEntity('IMAGE', 'MUTABLE', entityData)
      .getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    );
    onChange(newEditorState);
    doCollapse();
  };

  const ImageComponent = config.component || LayoutComponent;
  return (
    <ImageComponent
      config={config}
      translations={translations}
      onChange={addImage}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
    />
  );
};

ImageControl.propTypes = {
  editorState: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default ImageControl;
