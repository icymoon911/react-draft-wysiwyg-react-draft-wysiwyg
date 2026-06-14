import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Option from '../../../components/Option';
import Spinner from '../../../components/Spinner';
import './styles.css';

const LayoutComponent = ({
  expanded,
  onExpandEvent,
  doCollapse,
  onChange,
  config,
  translations,
}) => {
  const getInitialState = () => ({
    imgSrc: '',
    dragEnter: false,
    uploadHighlighted: config.uploadEnabled && !!config.uploadCallback,
    showImageLoading: false,
    height: config.defaultSize.height,
    width: config.defaultSize.width,
    alt: '',
  });

  const [imgSrc, setImgSrc] = useState('');
  const [dragEnter, setDragEnter] = useState(false);
  const [uploadHighlighted, setUploadHighlighted] = useState(
    config.uploadEnabled && !!config.uploadCallback
  );
  const [showImageLoading, setShowImageLoading] = useState(false);
  const [height, setHeight] = useState(config.defaultSize.height);
  const [width, setWidth] = useState(config.defaultSize.width);
  const [alt, setAlt] = useState('');

  const fileUploadRef = useRef(false);

  useEffect(() => {
    if (!expanded) {
      setImgSrc('');
      setDragEnter(false);
      setUploadHighlighted(config.uploadEnabled && !!config.uploadCallback);
      setShowImageLoading(false);
      setHeight(config.defaultSize.height);
      setWidth(config.defaultSize.width);
      setAlt('');
    }
  }, [expanded, config.uploadEnabled, config.uploadCallback, config.defaultSize.height, config.defaultSize.width]);

  const uploadImage = useCallback((file) => {
    setShowImageLoading(true);
    const { uploadCallback } = config;
    uploadCallback(file)
      .then(({ data }) => {
        setShowImageLoading(false);
        setDragEnter(false);
        setImgSrc(data.link || data.url);
        fileUploadRef.current = false;
      })
      .catch(() => {
        setShowImageLoading(false);
        setDragEnter(false);
      });
  }, [config]);

  const onDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragEnter(true);
  }, []);

  const onImageDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragEnter(false);

    let data;
    let dataIsItems;
    if (event.dataTransfer.items) {
      data = event.dataTransfer.items;
      dataIsItems = true;
    } else {
      data = event.dataTransfer.files;
      dataIsItems = false;
    }
    for (let i = 0; i < data.length; i += 1) {
      if (
        (!dataIsItems || data[i].kind === 'file') &&
        data[i].type.match('^image/')
      ) {
        const file = dataIsItems ? data[i].getAsFile() : data[i];
        uploadImage(file);
      }
    }
  }, [uploadImage]);

  const showImageUploadOption = useCallback(() => {
    setUploadHighlighted(true);
  }, []);

  const showImageURLOption = useCallback(() => {
    setUploadHighlighted(false);
  }, []);

  const addImageFromState = useCallback(() => {
    let h = height;
    let w = width;
    if (!isNaN(h)) {
      h += 'px';
    }
    if (!isNaN(w)) {
      w += 'px';
    }
    onChange(imgSrc, h, w, alt);
  }, [onChange, imgSrc, height, width, alt]);

  const updateValue = useCallback((event) => {
    const { name, value } = event.target;
    if (name === 'imgSrc') setImgSrc(value);
    else if (name === 'height') setHeight(value);
    else if (name === 'width') setWidth(value);
    else if (name === 'alt') setAlt(value);
  }, []);

  const selectImage = useCallback((event) => {
    if (event.target.files && event.target.files.length > 0) {
      uploadImage(event.target.files[0]);
    }
  }, [uploadImage]);

  const fileUploadClick = useCallback((event) => {
    fileUploadRef.current = true;
    event.stopPropagation();
  }, []);

  const handleStopPropagation = useCallback((event) => {
    if (!fileUploadRef.current) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      fileUploadRef.current = false;
    }
  }, []);

  const renderAddImageModal = () => {
    const {
      popupClassName,
      uploadCallback,
      uploadEnabled,
      urlEnabled,
      previewImage,
      inputAccept,
      alt: altConf,
    } = config;
    return (
      <div
        className={classNames('rdw-image-modal', popupClassName)}
        onClick={handleStopPropagation}
      >
        <div className="rdw-image-modal-header">
          {uploadEnabled && uploadCallback && (
            <span
              onClick={showImageUploadOption}
              className="rdw-image-modal-header-option"
            >
              {translations['components.controls.image.fileUpload']}
              <span
                className={classNames('rdw-image-modal-header-label', {
                  'rdw-image-modal-header-label-highlighted': uploadHighlighted,
                })}
              />
            </span>
          )}
          {urlEnabled && (
            <span
              onClick={showImageURLOption}
              className="rdw-image-modal-header-option"
            >
              {translations['components.controls.image.byURL']}
              <span
                className={classNames('rdw-image-modal-header-label', {
                  'rdw-image-modal-header-label-highlighted': !uploadHighlighted,
                })}
              />
            </span>
          )}
        </div>
        {uploadHighlighted ? (
          <div onClick={fileUploadClick}>
            <div
              onDragEnter={onDragEnter}
              onDragOver={handleStopPropagation}
              onDrop={onImageDrop}
              className={classNames('rdw-image-modal-upload-option', {
                'rdw-image-modal-upload-option-highlighted': dragEnter,
              })}
            >
              <label
                htmlFor="file"
                className="rdw-image-modal-upload-option-label"
              >
                {previewImage && imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={imgSrc}
                    className="rdw-image-modal-upload-option-image-preview"
                  />
                ) : (
                  imgSrc ||
                  translations['components.controls.image.dropFileText']
                )}
              </label>
            </div>
            <input
              type="file"
              id="file"
              accept={inputAccept}
              onChange={selectImage}
              className="rdw-image-modal-upload-option-input"
            />
          </div>
        ) : (
          <div className="rdw-image-modal-url-section">
            <input
              className="rdw-image-modal-url-input"
              placeholder={translations['components.controls.image.enterlink']}
              name="imgSrc"
              onChange={updateValue}
              onBlur={updateValue}
              value={imgSrc}
            />
            <span className="rdw-image-mandatory-sign">*</span>
          </div>
        )}
        {altConf.present && (
          <div className="rdw-image-modal-size">
            <span className="rdw-image-modal-alt-lbl">Alt Text</span>
            <input
              onChange={updateValue}
              onBlur={updateValue}
              value={alt}
              name="alt"
              className="rdw-image-modal-alt-input"
              placeholder="alt"
            />
            <span className="rdw-image-mandatory-sign">
              {altConf.mandatory && '*'}
            </span>
          </div>
        )}
        <div className="rdw-image-modal-size">
          &#8597;&nbsp;
          <input
            onChange={updateValue}
            onBlur={updateValue}
            value={height}
            name="height"
            className="rdw-image-modal-size-input"
            placeholder="Height"
          />
          <span className="rdw-image-mandatory-sign">*</span>
          &nbsp;&#8596;&nbsp;
          <input
            onChange={updateValue}
            onBlur={updateValue}
            value={width}
            name="width"
            className="rdw-image-modal-size-input"
            placeholder="Width"
          />
          <span className="rdw-image-mandatory-sign">*</span>
        </div>
        <span className="rdw-image-modal-btn-section">
          <button
            className="rdw-image-modal-btn"
            onClick={addImageFromState}
            disabled={
              !imgSrc || !height || !width || (altConf.mandatory && !alt)
            }
          >
            {translations['generic.add']}
          </button>
          <button className="rdw-image-modal-btn" onClick={doCollapse}>
            {translations['generic.cancel']}
          </button>
        </span>
        {showImageLoading ? (
          <div className="rdw-image-modal-spinner">
            <Spinner />
          </div>
        ) : (
          undefined
        )}
      </div>
    );
  };

  return (
    <div
      className="rdw-image-wrapper"
      aria-haspopup="true"
      aria-expanded={expanded}
      aria-label="rdw-image-control"
    >
      <Option
        className={classNames(config.className)}
        value="unordered-list-item"
        onClick={onExpandEvent}
        title={config.title || translations['components.controls.image.image']}
      >
        <img src={config.icon} alt="" />
      </Option>
      {expanded ? renderAddImageModal() : undefined}
    </div>
  );
};

LayoutComponent.propTypes = {
  expanded: PropTypes.bool,
  onExpandEvent: PropTypes.func,
  doCollapse: PropTypes.func,
  onChange: PropTypes.func,
  config: PropTypes.object,
  translations: PropTypes.object,
};

export default LayoutComponent;
