import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  toggleCustomInlineStyle,
  getSelectionCustomInlineStyle,
} from 'draftjs-utils';

import LayoutComponent from './Component';
import { useExpandCollapse, useEditorStateSync } from '../../utils/hooks';

const FontSize = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentFontSize = useEditorStateSync(
    editorState,
    (es) => getSelectionCustomInlineStyle(es, ['FONTSIZE']).FONTSIZE,
    undefined
  );

  const toggleFontSize = useCallback((fontSize) => {
    const newState = toggleCustomInlineStyle(editorState, 'fontSize', fontSize);
    if (newState) {
      onChange(newState);
    }
  }, [editorState, onChange]);

  const FontSizeComponent = config.component || LayoutComponent;
  const fontSize = currentFontSize && Number(currentFontSize.substring(9));
  return (
    <FontSizeComponent
      config={config}
      translations={translations}
      currentState={{ fontSize }}
      onChange={toggleFontSize}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
    />
  );
};

FontSize.propTypes = {
  onChange: PropTypes.func.isRequired,
  editorState: PropTypes.object,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default FontSize;
