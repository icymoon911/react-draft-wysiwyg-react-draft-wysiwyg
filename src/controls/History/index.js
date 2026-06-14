import React from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import useEditorStateSync from '../../hooks/useEditorStateSync';
import LayoutComponent from './Component';

const History = ({ onChange, editorState, modalHandler, config, translations }) => {
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

  const handleChange = (action) => {
    const newState = EditorState[action](editorState);
    if (newState) {
      onChange(newState);
    }
  };

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
      onChange={handleChange}
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
