import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { stopPropagation } from '../../../utils/common';
import Option from '../../../components/Option';
import './styles.css';

const LayoutComponent = ({ expanded, onExpandEvent, onChange, config, translations }) => {
  const handleChange = useCallback((event) => {
    onChange(event.target.innerHTML);
  }, [onChange]);

  const renderEmojiModal = () => {
    const { popupClassName, emojis } = config;
    return (
      <div
        className={classNames('rdw-emoji-modal', popupClassName)}
        onClick={stopPropagation}
      >
        {emojis.map((emoji, index) => (
          <span
            key={index}
            className="rdw-emoji-icon"
            alt=""
            onClick={handleChange}
          >
            {emoji}
          </span>
        ))}
      </div>
    );
  };

  const { icon, className, title } = config;
  return (
    <div
      className="rdw-emoji-wrapper"
      aria-haspopup="true"
      aria-label="rdw-emoji-control"
      aria-expanded={expanded}
      title={title || translations['components.controls.emoji.emoji']}
    >
      <Option
        className={classNames(className)}
        value="unordered-list-item"
        onClick={onExpandEvent}
      >
        <img src={icon} alt="" />
      </Option>
      {expanded ? renderEmojiModal() : undefined}
    </div>
  );
};

LayoutComponent.propTypes = {
  expanded: PropTypes.bool,
  onExpandEvent: PropTypes.func,
  onChange: PropTypes.func,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default LayoutComponent;
