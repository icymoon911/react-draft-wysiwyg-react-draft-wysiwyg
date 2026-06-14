import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Option from '../../../components/Option';
import { Dropdown, DropdownOption } from '../../../components/Dropdown';
import { getFirstIcon } from '../../../utils/toolbar';
import './styles.css';

const TextAlign = ({
  expanded,
  doExpand,
  doCollapse,
  onExpandEvent,
  config,
  onChange,
  currentState,
  translations,
}) => {
  const renderInFlatList = () => {
    const { options, left, center, right, justify, className } = config;
    const { textAlignment } = currentState;
    return (
      <div className={classNames('rdw-text-align-wrapper', className)} aria-label="rdw-textalign-control">
        {options.indexOf('left') >= 0 && <Option
          value="left"
          className={classNames(left.className)}
          active={textAlignment === 'left'}
          onClick={onChange}
          title={left.title || translations['components.controls.textalign.left']}
        >
          <img
            src={left.icon}
            alt=""
          />
        </Option>}
        {options.indexOf('center') >= 0 && <Option
          value="center"
          className={classNames(center.className)}
          active={textAlignment === 'center'}
          onClick={onChange}
          title={center.title || translations['components.controls.textalign.center']}
        >
          <img
            src={center.icon}
            alt=""
          />
        </Option>}
        {options.indexOf('right') >= 0 && <Option
          value="right"
          className={classNames(right.className)}
          active={textAlignment === 'right'}
          onClick={onChange}
          title={right.title || translations['components.controls.textalign.right']}
        >
          <img
            src={right.icon}
            alt=""
          />
        </Option>}
        {options.indexOf('justify') >= 0 && <Option
          value="justify"
          className={classNames(justify.className)}
          active={textAlignment === 'justify'}
          onClick={onChange}
          title={justify.title || translations['components.controls.textalign.justify']}
        >
          <img
            src={justify.icon}
            alt=""
          />
        </Option>}
      </div>
    );
  };

  const renderInDropDown = () => {
    const { options, left, center, right, justify, className, dropdownClassName, title } = config;
    const { textAlignment } = currentState;
    return (
      <Dropdown
        className={classNames('rdw-text-align-dropdown', className)}
        optionWrapperClassName={classNames(dropdownClassName)}
        onChange={onChange}
        expanded={expanded}
        doExpand={doExpand}
        doCollapse={doCollapse}
        onExpandEvent={onExpandEvent}
        aria-label="rdw-textalign-control"
        title={title || translations['components.controls.textalign.textalign']}
      >
        <img
          src={(textAlignment && config[textAlignment] && config[textAlignment].icon) || getFirstIcon(config)}
          alt=""
        />
        {options.indexOf('left') >= 0 && <DropdownOption
          value="left"
          active={textAlignment === 'left'}
          className={classNames('rdw-text-align-dropdownOption', left.className)}
          title={left.title || translations['components.controls.textalign.left']}
        >
          <img
            src={left.icon}
            alt=""
          />
        </DropdownOption>}
        {options.indexOf('center') >= 0 && <DropdownOption
          value="center"
          active={textAlignment === 'center'}
          className={classNames('rdw-text-align-dropdownOption', center.className)}
          title={center.title || translations['components.controls.textalign.center']}
        >
          <img
            src={center.icon}
            alt=""
          />
        </DropdownOption>}
        {options.indexOf('right') >= 0 && <DropdownOption
          value="right"
          active={textAlignment === 'right'}
          className={classNames('rdw-text-align-dropdownOption', right.className)}
          title={right.title || translations['components.controls.textalign.right']}
        >
          <img
            src={right.icon}
            alt=""
          />
        </DropdownOption>}
        {options.indexOf('justify') >= 0 && <DropdownOption
          value="justify"
          active={textAlignment === 'justify'}
          className={classNames('rdw-text-align-dropdownOption', justify.className)}
          title={justify.title || translations['components.controls.textalign.justify']}
        >
          <img
            src={justify.icon}
            alt=""
          />
        </DropdownOption>}
      </Dropdown>
    );
  };

  if (config.inDropdown) {
    return renderInDropDown();
  }
  return renderInFlatList();
};

TextAlign.propTypes = {
  expanded: PropTypes.bool,
  doExpand: PropTypes.func,
  doCollapse: PropTypes.func,
  onExpandEvent: PropTypes.func,
  config: PropTypes.object,
  onChange: PropTypes.func,
  currentState: PropTypes.object,
  translations: PropTypes.object,
};

export default TextAlign;
