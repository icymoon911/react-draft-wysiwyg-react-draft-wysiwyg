import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { stopPropagation } from '../../../utils/common';
import Option from '../../../components/Option';
import './styles.css';

const LayoutComponent = ({ expanded, onExpandEvent, onChange, config, currentState, translations }) => {
  const [currentStyle, setCurrentStyle] = useState('color');

  useEffect(() => {
    if (expanded) {
      setCurrentStyle('color');
    }
  }, [expanded]);

  const handleColorChange = useCallback((color) => {
    onChange(currentStyle, color);
  }, [onChange, currentStyle]);

  const setCurrentStyleColor = useCallback(() => {
    setCurrentStyle('color');
  }, []);

  const setCurrentStyleBgcolor = useCallback(() => {
    setCurrentStyle('bgcolor');
  }, []);

  const renderModal = () => {
    const {
      config: { popupClassName, colors },
      currentState: { color, bgColor },
    } = { config, currentState };
    const currentSelectedColor = currentStyle === 'color' ? color : bgColor;
    return (
      <div
        className={classNames('rdw-colorpicker-modal', popupClassName)}
        onClick={stopPropagation}
      >
        <span className="rdw-colorpicker-modal-header">
          <span
            className={classNames('rdw-colorpicker-modal-style-label', {
              'rdw-colorpicker-modal-style-label-active':
                currentStyle === 'color',
            })}
            onClick={setCurrentStyleColor}
          >
            {translations['components.controls.colorpicker.text']}
          </span>
          <span
            className={classNames('rdw-colorpicker-modal-style-label', {
              'rdw-colorpicker-modal-style-label-active':
                currentStyle === 'bgcolor',
            })}
            onClick={setCurrentStyleBgcolor}
          >
            {translations['components.controls.colorpicker.background']}
          </span>
        </span>
        <span className="rdw-colorpicker-modal-options">
          {colors.map((c, index) => (
            <Option
              value={c}
              key={index}
              className="rdw-colorpicker-option"
              activeClassName="rdw-colorpicker-option-active"
              active={currentSelectedColor === c}
              onClick={handleColorChange}
            >
              <span
                style={{ backgroundColor: c }}
                className="rdw-colorpicker-cube"
              />
            </Option>
          ))}
        </span>
      </div>
    );
  };

  return (
    <div
      className="rdw-colorpicker-wrapper"
      aria-haspopup="true"
      aria-expanded={expanded}
      aria-label="rdw-color-picker"
      title={
        config.title || translations['components.controls.colorpicker.colorpicker']
      }
    >
      <Option onClick={onExpandEvent} className={classNames(config.className)}>
        <img src={config.icon} alt="" />
      </Option>
      {expanded ? renderModal() : undefined}
    </div>
  );
};

LayoutComponent.propTypes = {
  expanded: PropTypes.bool,
  onExpandEvent: PropTypes.func,
  onChange: PropTypes.func,
  config: PropTypes.object,
  currentState: PropTypes.object,
  translations: PropTypes.object,
};

export default LayoutComponent;
