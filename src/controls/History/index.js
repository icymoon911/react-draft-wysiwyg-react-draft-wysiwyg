import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';

import LayoutComponent from './Component';
import { useExpandCollapse, useEditorStateSync } from '../../utils/hooks';

const History = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const undoDisabled = useEditorStateSync(
    editorState,
    (es) => es.getUndoStack().size === 0,
    false
  );

  const redoDisabled = useEditorStateSync(
    editorState,
    (es) => es.getRedoStack().size === 0,
    false
  );

  const historyOnChange = useCallback((action) => {
    const newState = EditorState[action](editorState);
    if (newState) {
      onChange(newState);
    }
  }, [editorState, onChange]);

  const HistoryComponent = config.component || LayoutComponent;
  return (
    <HistoryComponent
      config={config}
      translations={translations}
      currentState={{ undoDisabled, redoDisabled }}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
      onChange={historyOnChange}
    />
  );
};

History.propTypes = {
  onChange: PropTypes.func.isRequired,
  editorState: PropTypes.object,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default History;
