import React from 'react';
import PropTypes from 'prop-types';
import {
  toggleCustomInlineStyle,
  getSelectionCustomInlineStyle,
} from 'draftjs-utils';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import useEditorStateSync from '../../hooks/useEditorStateSync';
import LayoutComponent from './Component';

const FontFamily = ({ onChange, editorState, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentFontFamily = useEditorStateSync(
    editorState,
    (es) => getSelectionCustomInlineStyle(es, ['FONTFAMILY']).FONTFAMILY,
    undefined
  );

  const toggleFontFamily = (fontFamily) => {
    const newState = toggleCustomInlineStyle(editorState, 'fontFamily', fontFamily);
    if (newState) {
      onChange(newState);
    }
  };

  const fontFamily = currentFontFamily && currentFontFamily.substring(11);
  const FontFamilyComponent = config.component || LayoutComponent;
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
