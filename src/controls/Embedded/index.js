import React from 'react';
import PropTypes from 'prop-types';
import { AtomicBlockUtils } from 'draft-js';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import LayoutComponent from './Component';

const Embedded = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const addEmbeddedLink = (embeddedLink, height, width) => {
    const src = config.embedCallback ? config.embedCallback(embeddedLink) : embeddedLink;
    const entityKey = editorState
      .getCurrentContent()
      .createEntity('EMBEDDED_LINK', 'MUTABLE', { src, height, width })
      .getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    );
    onChange(newEditorState);
    doCollapse();
  };

  const EmbeddedComponent = config.component || LayoutComponent;
  return (
    <EmbeddedComponent
      config={config}
      translations={translations}
      onChange={addEmbeddedLink}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
    />
  );
};

Embedded.propTypes = {
  editorState: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default Embedded;
