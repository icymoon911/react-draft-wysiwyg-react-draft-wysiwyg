import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { getSelectedBlocksMetadata, setBlockData } from 'draftjs-utils';

import LayoutComponent from './Component';
import { useExpandCollapse, useEditorStateSync } from '../../utils/hooks';

const TextAlign = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentTextAlignment = useEditorStateSync(
    editorState,
    (es) => getSelectedBlocksMetadata(es).get('text-align'),
    undefined
  );

  const addBlockAlignmentData = useCallback((value) => {
    if (currentTextAlignment !== value) {
      onChange(setBlockData(editorState, { 'text-align': value }));
    } else {
      onChange(setBlockData(editorState, { 'text-align': undefined }));
    }
  }, [editorState, onChange, currentTextAlignment]);

  const TextAlignmentComponent = config.component || LayoutComponent;
  return (
    <TextAlignmentComponent
      config={config}
      translations={translations}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
      currentState={{ textAlignment: currentTextAlignment }}
      onChange={addBlockAlignmentData}
    />
  );
};

TextAlign.propTypes = {
  editorState: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default TextAlign;
