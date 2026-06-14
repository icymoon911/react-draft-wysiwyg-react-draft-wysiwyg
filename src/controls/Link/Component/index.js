import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { stopPropagation } from '../../../utils/common';
import { getFirstIcon } from '../../../utils/toolbar';
import Option from '../../../components/Option';
import { Dropdown, DropdownOption } from '../../../components/Dropdown';
import './styles.css';

const LayoutComponent = ({ expanded, doExpand, doCollapse, onExpandEvent, config, onChange, currentState, translations }) => {
  const [showModal, setShowModal] = useState(false);
  const [linkTarget, setLinkTarget] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkTargetOption, setLinkTargetOption] = useState(config.defaultTargetOption);

  useEffect(() => {
    if (!expanded) {
      setShowModal(false);
      setLinkTarget('');
      setLinkTitle('');
      setLinkTargetOption(config.defaultTargetOption);
    }
  }, [expanded, config.defaultTargetOption]);

  const removeLink = useCallback(() => {
    onChange('unlink');
  }, [onChange]);

  const addLink = useCallback(() => {
    onChange('link', linkTitle, linkTarget, linkTargetOption);
  }, [onChange, linkTitle, linkTarget, linkTargetOption]);

  const updateValue = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'linkTitle') setLinkTitle(value);
    else if (name === 'linkTarget') setLinkTarget(value);
  }, []);

  const updateTargetOption = useCallback((event) => {
    setLinkTargetOption(event.target.checked ? '_blank' : '_self');
  }, []);

  const hideModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const signalExpandShowModal = useCallback(() => {
    const { link, selectionText } = currentState;
    onExpandEvent();
    setShowModal(true);
    setLinkTarget((link && link.target) || '');
    setLinkTargetOption((link && link.targetOption) || config.defaultTargetOption);
    setLinkTitle((link && link.title) || selectionText);
  }, [currentState, onExpandEvent, config.defaultTargetOption]);

  const forceExpandAndShowModal = useCallback(() => {
    const { link, selectionText } = currentState;
    doExpand();
    setShowModal(true);
    setLinkTarget(link && link.target);
    setLinkTargetOption((link && link.targetOption) || config.defaultTargetOption);
    setLinkTitle((link && link.title) || selectionText);
  }, [currentState, doExpand, config.defaultTargetOption]);

  const renderAddLinkModal = () => {
    const { popupClassName } = config;
    return (
      <div
        className={classNames('rdw-link-modal', popupClassName)}
        onClick={stopPropagation}
      >
        <label className="rdw-link-modal-label" htmlFor="linkTitle">
          {translations['components.controls.link.linkTitle']}
        </label>
        <input
          id="linkTitle"
          className="rdw-link-modal-input"
          onChange={updateValue}
          onBlur={updateValue}
          name="linkTitle"
          value={linkTitle}
        />
        <label className="rdw-link-modal-label" htmlFor="linkTarget">
          {translations['components.controls.link.linkTarget']}
        </label>
        <input
          id="linkTarget"
          className="rdw-link-modal-input"
          onChange={updateValue}
          onBlur={updateValue}
          name="linkTarget"
          value={linkTarget}
        />
        <label
          className="rdw-link-modal-target-option"
          htmlFor="openLinkInNewWindow"
        >
          <input
            id="openLinkInNewWindow"
            type="checkbox"
            defaultChecked={linkTargetOption === '_blank'}
            value="_blank"
            onChange={updateTargetOption}
          />
          <span>
            {translations['components.controls.link.linkTargetOption']}
          </span>
        </label>
        <span className="rdw-link-modal-buttonsection">
          <button
            className="rdw-link-modal-btn"
            onClick={addLink}
            disabled={!linkTarget || !linkTitle}
          >
            {translations['generic.add']}
          </button>
          <button className="rdw-link-modal-btn" onClick={doCollapse}>
            {translations['generic.cancel']}
          </button>
        </span>
      </div>
    );
  };

  const renderInFlatList = () => {
    const { options, link, unlink, className } = config;
    return (
      <div
        className={classNames('rdw-link-wrapper', className)}
        aria-label="rdw-link-control"
      >
        {options.indexOf('link') >= 0 && (
          <Option
            value="unordered-list-item"
            className={classNames(link.className)}
            onClick={signalExpandShowModal}
            aria-haspopup="true"
            aria-expanded={showModal}
            title={link.title || translations['components.controls.link.link']}
          >
            <img src={link.icon} alt="" />
          </Option>
        )}
        {options.indexOf('unlink') >= 0 && (
          <Option
            disabled={!currentState.link}
            value="ordered-list-item"
            className={classNames(unlink.className)}
            onClick={removeLink}
            title={
              unlink.title || translations['components.controls.link.unlink']
            }
          >
            <img src={unlink.icon} alt="" />
          </Option>
        )}
        {expanded && showModal ? renderAddLinkModal() : undefined}
      </div>
    );
  };

  const renderInDropDown = () => {
    const { options, link, unlink, className, dropdownClassName, title } = config;
    return (
      <div
        className="rdw-link-wrapper"
        aria-haspopup="true"
        aria-label="rdw-link-control"
        aria-expanded={expanded}
        title={title}
      >
        <Dropdown
          className={classNames('rdw-link-dropdown', className)}
          optionWrapperClassName={classNames(dropdownClassName)}
          onChange={onChange}
          expanded={expanded && !showModal}
          doExpand={doExpand}
          doCollapse={doCollapse}
          onExpandEvent={onExpandEvent}
        >
          <img src={getFirstIcon(config)} alt="" />
          {options.indexOf('link') >= 0 && (
            <DropdownOption
              onClick={forceExpandAndShowModal}
              className={classNames('rdw-link-dropdownoption', link.className)}
              title={
                link.title || translations['components.controls.link.link']
              }
            >
              <img src={link.icon} alt="" />
            </DropdownOption>
          )}
          {options.indexOf('unlink') >= 0 && (
            <DropdownOption
              onClick={removeLink}
              disabled={!currentState.link}
              className={classNames(
                'rdw-link-dropdownoption',
                unlink.className
              )}
              title={
                unlink.title || translations['components.controls.link.unlink']
              }
            >
              <img src={unlink.icon} alt="" />
            </DropdownOption>
          )}
        </Dropdown>
        {expanded && showModal ? renderAddLinkModal() : undefined}
      </div>
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
};

export default LayoutComponent;
