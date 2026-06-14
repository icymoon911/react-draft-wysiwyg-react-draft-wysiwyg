import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Dropdown, DropdownOption } from '../../../components/Dropdown';
import './styles.css';

const LayoutComponent = ({
  expanded,
  onExpandEvent,
  doExpand,
  doCollapse,
  onChange,
  config,
  currentState,
  translations,
}) => {
  const [defaultFontSize, setDefaultFontSize] = useState(undefined);

  useEffect(() => {
    const editorElm = document.getElementsByClassName('DraftEditor-root');
    if (editorElm && editorElm.length > 0) {
      const editorStyles = window.getComputedStyle(editorElm[0]);
      let fontSize = editorStyles.getPropertyValue('font-size');
      fontSize = fontSize.substring(0, fontSize.length - 2);
      setDefaultFontSize(fontSize);
    }
  }, []);

  const { icon, className, dropdownClassName, options, title } = config;
  let { fontSize: currentFontSize } = currentState;
  const numDefaultFontSize = Number(defaultFontSize);
  currentFontSize = currentFontSize ||
    (options && options.indexOf(numDefaultFontSize) >= 0 && numDefaultFontSize);

  return (
    <div className="rdw-fontsize-wrapper" aria-label="rdw-font-size-control">
      <Dropdown
        className={classNames('rdw-fontsize-dropdown', className)}
        optionWrapperClassName={classNames(dropdownClassName)}
        onChange={onChange}
        expanded={expanded}
        doExpand={doExpand}
        doCollapse={doCollapse}
        onExpandEvent={onExpandEvent}
        title={title || translations['components.controls.fontsize.fontsize']}
      >
        {currentFontSize ?
          <span>{currentFontSize}</span> :
          <img src={icon} alt="" />
        }
        {
          options.map((size, index) =>
            (<DropdownOption
              className="rdw-fontsize-option"
              active={currentFontSize === size}
              value={size}
              key={index}
            >
              {size}
            </DropdownOption>),
          )
        }
      </Dropdown>
    </div>
  );
};

LayoutComponent.propTypes = {
  expanded: PropTypes.bool,
  onExpandEvent: PropTypes.func,
  doExpand: PropTypes.func,
  doCollapse: PropTypes.func,
  onChange: PropTypes.func,
  config: PropTypes.object,
  currentState: PropTypes.object,
  translations: PropTypes.object,
};

export default LayoutComponent;
