import React from 'react';
import PropTypes from 'prop-types';
import { RichUtils } from 'draft-js';
import {
  changeDepth,
  getBlockBeforeSelectedBlock,
  getSelectedBlock,
  isListBlock,
} from 'draftjs-utils';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import useEditorStateSync from '../../hooks/useEditorStateSync';
import LayoutComponent from './Component';

const List = ({ onChange, editorState, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentBlock = useEditorStateSync(
    editorState,
    (es) => getSelectedBlock(es),
    undefined
  );

  const toggleBlockType = (blockType) => {
    const newState = RichUtils.toggleBlockType(editorState, blockType);
    if (newState) {
      onChange(newState);
    }
  };

  const adjustDepth = (adjustment) => {
    const newState = changeDepth(editorState, adjustment, 4);
    if (newState) {
      onChange(newState);
    }
  };

  const handleChange = (value) => {
    if (value === 'unordered') {
      toggleBlockType('unordered-list-item');
    } else if (value === 'ordered') {
      toggleBlockType('ordered-list-item');
    } else if (value === 'indent') {
      adjustDepth(1);
    } else {
      adjustDepth(-1);
    }
  };

  const isIndentDisabled = () => {
    const previousBlock = getBlockBeforeSelectedBlock(editorState);
    if (
      !previousBlock ||
      !isListBlock(currentBlock) ||
      previousBlock.get('type') !== currentBlock.get('type') ||
      previousBlock.get('depth') < currentBlock.get('depth')
    ) {
      return true;
    }
    return false;
  };

  const isOutdentDisabled = () => (
    !currentBlock ||
    !isListBlock(currentBlock) ||
    currentBlock.get('depth') <= 0
  );

  let listType;
  if (currentBlock.get('type') === 'unordered-list-item') {
    listType = 'unordered';
  } else if (currentBlock.get('type') === 'ordered-list-item') {
    listType = 'ordered';
  }

  const ListComponent = config.component || LayoutComponent;
  return (
    <ListComponent
      config={config}
      translations={translations}
      currentState={{ listType }}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
      onChange={handleChange}
      indentDisabled={isIndentDisabled()}
      outdentDisabled={isOutdentDisabled()}
    />
  );
};

List.propTypes = {
  onChange: PropTypes.func.isRequired,
  editorState: PropTypes.object.isRequired,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default List;
