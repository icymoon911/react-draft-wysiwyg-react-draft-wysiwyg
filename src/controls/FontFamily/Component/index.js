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
  const [defaultFontFamily, setDefaultFontFamily] = useState(undefined);

  useEffect(() => {
    const editorElm = document.getElementsByClassName('DraftEditor-root');
    if (editorElm && editorElm.length > 0) {
      const editorStyles = window.getComputedStyle(editorElm[0]);
      const fontFamily = editorStyles.getPropertyValue('font-family');
      setDefaultFontFamily(fontFamily);
    }
  }, []);

  const { className, dropdownClassName, options, title } = config;
  let { fontFamily: currentFontFamily } = currentState;
  currentFontFamily = currentFontFamily ||
    (options &&
      defaultFontFamily &&
      options.some(opt => opt.toLowerCase() === defaultFontFamily.toLowerCase()) &&
      defaultFontFamily);

  return (
    <div className="rdw-fontfamily-wrapper" aria-label="rdw-font-family-control">
      <Dropdown
        className={classNames('rdw-fontfamily-dropdown', className)}
        optionWrapperClassName={classNames('rdw-fontfamily-optionwrapper', dropdownClassName)}
        onChange={onChange}
        expanded={expanded}
        doExpand={doExpand}
        doCollapse={doCollapse}
        onExpandEvent={onExpandEvent}
        title={title || translations['components.controls.fontfamily.fontfamily']}
      >
        <span className="rdw-fontfamily-placeholder">
          {currentFontFamily || translations['components.controls.fontfamily.fontfamily']}
        </span>
        {
          options.map((family, index) =>
            (<DropdownOption
              active={currentFontFamily === family}
              value={family}
              key={index}
            >
              {family}
            </DropdownOption>))
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
