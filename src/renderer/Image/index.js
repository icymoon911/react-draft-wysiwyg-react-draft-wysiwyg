import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';
import classNames from 'classnames';
import Option from '../../components/Option';
import './styles.css';

const getImageComponent = config => {
  const Image = ({ block, contentState }) => {
    const [hovered, setHovered] = useState(false);
    const [, setRenderKey] = useState(0);

    const setEntityAlignment = useCallback((alignment) => {
      const entityKey = block.getEntityAt(0);
      contentState.mergeEntityData(
        entityKey,
        { alignment },
      );
      config.onChange(EditorState.push(config.getEditorState(), contentState, 'change-block-data'));
      // Force re-render via state change instead of the dummy hack
      setRenderKey(prev => prev + 1);
    }, [block, contentState]);

    const setEntityAlignmentLeft = useCallback(() => {
      setEntityAlignment('left');
    }, [setEntityAlignment]);

    const setEntityAlignmentRight = useCallback(() => {
      setEntityAlignment('right');
    }, [setEntityAlignment]);

    const setEntityAlignmentCenter = useCallback(() => {
      setEntityAlignment('none');
    }, [setEntityAlignment]);

    const toggleHovered = useCallback(() => {
      setHovered(prev => !prev);
    }, []);

    const renderAlignmentOptions = (alignment) => (
      <div
        className={classNames(
          'rdw-image-alignment-options-popup',
          {
            'rdw-image-alignment-options-popup-right': alignment === 'right',
          },
        )}
      >
        <Option
          onClick={setEntityAlignmentLeft}
          className="rdw-image-alignment-option"
        >
          L
        </Option>
        <Option
          onClick={setEntityAlignmentCenter}
          className="rdw-image-alignment-option"
        >
          C
        </Option>
        <Option
          onClick={setEntityAlignmentRight}
          className="rdw-image-alignment-option"
        >
          R
        </Option>
      </div>
    );

    const { isReadOnly, isImageAlignmentEnabled } = config;
    const entity = contentState.getEntity(block.getEntityAt(0));
    const { src, alignment, height, width, alt } = entity.getData();

    return (
      <span
        onMouseEnter={toggleHovered}
        onMouseLeave={toggleHovered}
        className={classNames(
          'rdw-image-alignment',
          {
            'rdw-image-left': alignment === 'left',
            'rdw-image-right': alignment === 'right',
            'rdw-image-center': !alignment || alignment === 'none',
          },
        )}
      >
        <span className="rdw-image-imagewrapper">
          <img
            src={src}
            alt={alt}
            style={{
              height,
              width,
            }}
          />
          {
            !isReadOnly() && hovered && isImageAlignmentEnabled() ?
              renderAlignmentOptions(alignment)
              :
              undefined
          }
        </span>
      </span>
    );
  };

  Image.propTypes = {
    block: PropTypes.object,
    contentState: PropTypes.object,
  };

  return Image;
};

export default getImageComponent;
