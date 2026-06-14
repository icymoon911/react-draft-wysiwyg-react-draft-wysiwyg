import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getFirstIcon } from '../../../utils/toolbar';
import { Dropdown, DropdownOption } from '../../../components/Dropdown';
import Option from '../../../components/Option';
import './styles.css';

const options = ['unordered', 'ordered', 'indent', 'outdent'];

const LayoutComponent = ({
  expanded,
  doExpand,
  doCollapse,
  onExpandEvent,
  config,
  onChange,
  currentState,
  translations,
  indentDisabled,
  outdentDisabled,
}) => {
  const toggleBlockType = useCallback((blockType) => {
    onChange(blockType);
  }, [onChange]);

  const indent = useCallback(() => {
    onChange('indent');
  }, [onChange]);

  const outdent = useCallback(() => {
    onChange('outdent');
  }, [onChange]);

  const renderInFlatList = () => {
    const { unordered, ordered, indent: indentConf, outdent: outdentConf, className } = config;
    const { listType } = currentState;
    return (
      <div className={classNames('rdw-list-wrapper', className)} aria-label="rdw-list-control">
        {config.options.indexOf('unordered') >= 0 && <Option
          value="unordered"
          onClick={toggleBlockType}
          className={classNames(unordered.className)}
          active={listType === 'unordered'}
          title={unordered.title || translations['components.controls.list.unordered']}
        >
          <img
            src={unordered.icon}
            alt=""
          />
        </Option>}
        {config.options.indexOf('ordered') >= 0 && <Option
          value="ordered"
          onClick={toggleBlockType}
          className={classNames(ordered.className)}
          active={listType === 'ordered'}
          title={ordered.title || translations['components.controls.list.ordered']}
        >
          <img
            src={ordered.icon}
            alt=""
          />
        </Option>}
        {config.options.indexOf('indent') >= 0 && <Option
          onClick={indent}
          disabled={indentDisabled}
          className={classNames(indentConf.className)}
          title={indentConf.title || translations['components.controls.list.indent']}
        >
          <img
            src={indentConf.icon}
            alt=""
          />
        </Option>}
        {config.options.indexOf('outdent') >= 0 && <Option
          onClick={outdent}
          disabled={outdentDisabled}
          className={classNames(outdentConf.className)}
          title={outdentConf.title || translations['components.controls.list.outdent']}
        >
          <img
            src={outdentConf.icon}
            alt=""
          />
        </Option>}
      </div>
    );
  };

  const renderInDropDown = () => {
    const { className, dropdownClassName, title } = config;
    const { listType } = currentState;
    return (
      <Dropdown
        className={classNames('rdw-list-dropdown', className)}
        optionWrapperClassName={classNames(dropdownClassName)}
        onChange={onChange}
        expanded={expanded}
        doExpand={doExpand}
        doCollapse={doCollapse}
        onExpandEvent={onExpandEvent}
        aria-label="rdw-list-control"
        title={title || translations['components.controls.list.list']}
      >
        <img
          src={getFirstIcon(config)}
          alt=""
        />
        { options
          .filter(option => config.options.indexOf(option) >= 0)
          .map((option, index) => (<DropdownOption
            key={index}
            value={option}
            disabled={option === 'indent' ? indentDisabled : option === 'outdent' ? outdentDisabled : undefined}
            className={classNames('rdw-list-dropdownOption', config[option].className)}
            active={listType === option}
            title={config[option].title || translations[`components.controls.list.${option}`]}
          >
            <img
              src={config[option].icon}
              alt=""
            />
          </DropdownOption>))
        }
      </Dropdown>
    );
  };

  if (config.inDropdown) {
    return renderInDropDown();
  }
  return renderInFlatList();
};

LayoutComponent.propTypes = {
  expanded: PropTypes.bool,
  doExpand: PropTypes.func,
  doCollapse: PropTypes.func,
  onExpandEvent: PropTypes.func,
  config: PropTypes.object,
  onChange: PropTypes.func,
  currentState: PropTypes.object,
  translations: PropTypes.object,
  indentDisabled: PropTypes.bool,
  outdentDisabled: PropTypes.bool,
};

export default LayoutComponent;
