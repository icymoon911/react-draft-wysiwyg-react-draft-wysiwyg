import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { getSelectedBlocksType } from 'draftjs-utils';
import { RichUtils } from 'draft-js';

import LayoutComponent from './Component';
import { useExpandCollapse, useEditorStateSync } from '../../utils/hooks';

const BlockType = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentBlockType = useEditorStateSync(
    editorState,
    (es) => getSelectedBlocksType(es),
    'unstyled'
  );

  const blocksTypes = [
    { label: 'Normal', style: 'unstyled' },
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'Code', style: 'code' },
  ];

  const toggleBlockType = useCallback((blockType) => {
    const blockTypeValue = blocksTypes.find(bt => bt.label === blockType).style;
    const newState = RichUtils.toggleBlockType(editorState, blockTypeValue);
    if (newState) {
      onChange(newState);
    }
  }, [editorState, onChange]);

  const BlockTypeComponent = config.component || LayoutComponent;
  const blockType = blocksTypes.find(bt => bt.style === currentBlockType);
  return (
    <BlockTypeComponent
      config={config}
      translations={translations}
      currentState={{ blockType: blockType && blockType.label }}
      onChange={toggleBlockType}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
    />
  );
};

BlockType.propTypes = {
  onChange: PropTypes.func.isRequired,
  editorState: PropTypes.object,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default BlockType;
