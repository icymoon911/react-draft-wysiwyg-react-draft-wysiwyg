import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { stopPropagation } from '../../../utils/common';
import Option from '../../../components/Option';
import './styles.css';

const LayoutComponent = ({ expanded, onExpandEvent, onChange, config, translations, doCollapse }) => {
  const [embeddedLink, setEmbeddedLink] = useState('');
  const [height, setHeight] = useState(config.defaultSize.height);
  const [width, setWidth] = useState(config.defaultSize.width);

  useEffect(() => {
    if (!expanded) {
      setEmbeddedLink('');
      setHeight(config.defaultSize.height);
      setWidth(config.defaultSize.width);
    }
  }, [expanded, config.defaultSize.height, config.defaultSize.width]);

  const handleSubmit = useCallback(() => {
    onChange(embeddedLink, height, width);
  }, [onChange, embeddedLink, height, width]);

  const updateValue = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'embeddedLink') setEmbeddedLink(value);
    else if (name === 'height') setHeight(value);
    else if (name === 'width') setWidth(value);
  }, []);

  const renderEmbeddedLinkModal = () => {
    const { popupClassName } = config;
    return (
      <div
        className={classNames('rdw-embedded-modal', popupClassName)}
        onClick={stopPropagation}
      >
        <div className="rdw-embedded-modal-header">
          <span className="rdw-embedded-modal-header-option">
            {translations['components.controls.embedded.embeddedlink']}
            <span className="rdw-embedded-modal-header-label" />
          </span>
        </div>
        <div className="rdw-embedded-modal-link-section">
          <span className="rdw-embedded-modal-link-input-wrapper">
            <input
              className="rdw-embedded-modal-link-input"
              placeholder={
                translations['components.controls.embedded.enterlink']
              }
              onChange={updateValue}
              onBlur={updateValue}
              value={embeddedLink}
              name="embeddedLink"
            />
            <span className="rdw-image-mandatory-sign">*</span>
          </span>
          <div className="rdw-embedded-modal-size">
            <span>
              <input
                onChange={updateValue}
                onBlur={updateValue}
                value={height}
                name="height"
                className="rdw-embedded-modal-size-input"
                placeholder="Height"
              />
              <span className="rdw-image-mandatory-sign">*</span>
            </span>
            <span>
              <input
                onChange={updateValue}
                onBlur={updateValue}
                value={width}
                name="width"
                className="rdw-embedded-modal-size-input"
                placeholder="Width"
              />
              <span className="rdw-image-mandatory-sign">*</span>
            </span>
          </div>
        </div>
        <span className="rdw-embedded-modal-btn-section">
          <button
            type="button"
            className="rdw-embedded-modal-btn"
            onClick={handleSubmit}
            disabled={!embeddedLink || !height || !width}
          >
            {translations['generic.add']}
          </button>
          <button
            type="button"
            className="rdw-embedded-modal-btn"
            onClick={doCollapse}
          >
            {translations['generic.cancel']}
          </button>
        </span>
      </div>
    );
  };

  const { icon, className, title } = config;
  return (
    <div
      className="rdw-embedded-wrapper"
      aria-haspopup="true"
      aria-expanded={expanded}
      aria-label="rdw-embedded-control"
    >
      <Option
        className={classNames(className)}
        value="unordered-list-item"
        onClick={onExpandEvent}
        title={title || translations['components.controls.embedded.embedded']}
      >
        <img src={icon} alt="" />
      </Option>
      {expanded ? renderEmbeddedLinkModal() : undefined}
    </div>
  );
};

LayoutComponent.propTypes = {
  expanded: PropTypes.bool,
  onExpandEvent: PropTypes.func,
  onChange: PropTypes.func,
  config: PropTypes.object,
  translations: PropTypes.object,
  doCollapse: PropTypes.func,
};

export default LayoutComponent;
