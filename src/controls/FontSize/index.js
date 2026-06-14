import React from 'react';
import PropTypes from 'prop-types';
import {
  toggleCustomInlineStyle,
  getSelectionCustomInlineStyle,
} from 'draftjs-utils';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import useEditorStateSync from '../../hooks/useEditorStateSync';
import LayoutComponent from './Component';

const FontSize = ({ onChange, editorState, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentFontSize = useEditorStateSync(
    editorState,
    (es) => getSelectionCustomInlineStyle(es, ['FONTSIZE']).FONTSIZE,
    undefined
  );

  const toggleFontSize = (fontSize) => {
    const newState = toggleCustomInlineStyle(editorState, 'fontSize', fontSize);
    if (newState) {
      onChange(newState);
    }
  };

  const fontSize = currentFontSize && Number(currentFontSize.substring(9));
  const FontSizeComponent = config.component || LayoutComponent;
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
