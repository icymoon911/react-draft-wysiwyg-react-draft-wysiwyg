import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  toggleCustomInlineStyle,
  getSelectionCustomInlineStyle,
} from 'draftjs-utils';

import LayoutComponent from './Component';
import { useExpandCollapse, useEditorStateSync } from '../../utils/hooks';

const FontFamily = ({ editorState, onChange, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentFontFamily = useEditorStateSync(
    editorState,
    (es) => getSelectionCustomInlineStyle(es, ['FONTFAMILY']).FONTFAMILY,
    undefined
  );

  const toggleFontFamily = useCallback((fontFamily) => {
    const newState = toggleCustomInlineStyle(editorState, 'fontFamily', fontFamily);
    if (newState) {
      onChange(newState);
    }
  }, [editorState, onChange]);

  const FontFamilyComponent = config.component || LayoutComponent;
  const fontFamily = currentFontFamily && currentFontFamily.substring(11);
  return (
    <FontFamilyComponent
      translations={translations}
      config={config}
      currentState={{ fontFamily }}
      onChange={toggleFontFamily}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
    />
  );
};

FontFamily.propTypes = {
  onChange: PropTypes.func.isRequired,
  editorState: PropTypes.object,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default FontFamily;
