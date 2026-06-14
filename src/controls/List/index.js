import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { RichUtils } from 'draft-js';
import {
  changeDepth,
  getBlockBeforeSelectedBlock,
  getSelectedBlock,
  isListBlock,
} from 'draftjs-utils';

import LayoutComponent from './Component';
import { useExpandCollapse, useEditorStateSync } from '../../utils/hooks';

const List = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentBlock = useEditorStateSync(
    editorState,
    (es) => getSelectedBlock(es),
    editorState ? getSelectedBlock(editorState) : undefined
  );

  const toggleBlockType = useCallback((blockType) => {
    const newState = RichUtils.toggleBlockType(editorState, blockType);
    if (newState) {
      onChange(newState);
    }
  }, [editorState, onChange]);

  const adjustDepth = useCallback((adjustment) => {
    const newState = changeDepth(editorState, adjustment, 4);
    if (newState) {
      onChange(newState);
    }
  }, [editorState, onChange]);

  const listOnChange = useCallback((value) => {
    if (value === 'unordered') {
      toggleBlockType('unordered-list-item');
    } else if (value === 'ordered') {
      toggleBlockType('ordered-list-item');
    } else if (value === 'indent') {
      adjustDepth(1);
    } else {
      adjustDepth(-1);
    }
  }, [toggleBlockType, adjustDepth]);

  const isIndentDisabled = useCallback(() => {
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
  }, [editorState, currentBlock]);

  const isOutdentDisabled = useCallback(() => (
    !currentBlock ||
    !isListBlock(currentBlock) ||
    currentBlock.get('depth') <= 0
  ), [currentBlock]);

  const listType = useMemo(() => {
    if (currentBlock && currentBlock.get('type') === 'unordered-list-item') {
      return 'unordered';
    } else if (currentBlock && currentBlock.get('type') === 'ordered-list-item') {
      return 'ordered';
    }
    return undefined;
  }, [currentBlock]);

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
      onChange={listOnChange}
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
