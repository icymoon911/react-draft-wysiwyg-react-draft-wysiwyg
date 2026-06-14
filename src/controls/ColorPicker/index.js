import React from 'react';
import PropTypes from 'prop-types';
import {
  toggleCustomInlineStyle,
  getSelectionCustomInlineStyle,
} from 'draftjs-utils';

import useExpandCollapse from '../../hooks/useExpandCollapse';
import useEditorStateSync from '../../hooks/useEditorStateSync';
import LayoutComponent from './Component';

const ColorPicker = ({ onChange, editorState, modalHandler, config, translations }) => {
  const { expanded, onExpandEvent, doExpand, doCollapse } = useExpandCollapse(modalHandler);

  const currentColor = useEditorStateSync(
    editorState,
    (es) => getSelectionCustomInlineStyle(es, ['COLOR']).COLOR,
    undefined
  );

  const currentBgColor = useEditorStateSync(
    editorState,
    (es) => getSelectionCustomInlineStyle(es, ['BGCOLOR']).BGCOLOR,
    undefined
  );

  const toggleColor = (style, color) => {
    const newState = toggleCustomInlineStyle(editorState, style, color);
    if (newState) {
      onChange(newState);
    }
    doCollapse();
  };

  const color = currentColor && currentColor.substring(6);
  const bgColor = currentBgColor && currentBgColor.substring(8);

  const ColorPickerComponent = config.component || LayoutComponent;
  return (
    <ColorPickerComponent
      config={config}
      translations={translations}
      onChange={toggleColor}
      expanded={expanded}
      onExpandEvent={onExpandEvent}
      doExpand={doExpand}
      doCollapse={doCollapse}
      currentState={{ color, bgColor }}
    />
  );
};

ColorPicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  editorState: PropTypes.object.isRequired,
  modalHandler: PropTypes.object,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default ColorPicker;
