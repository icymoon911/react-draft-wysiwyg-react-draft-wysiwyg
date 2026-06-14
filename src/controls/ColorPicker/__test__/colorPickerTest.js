/* @flow */

import React from 'react';
import {
  EditorState,
  convertFromHTML,
  ContentState,
} from 'draft-js';
import { expect } from 'chai';
import { mount } from 'enzyme';

import ColorPicker from '..';
import defaultToolbar from '../../../config/defaultToolbar';
import ModalHandler from '../../../event-handler/modals';
import localeTranslations from '../../../i18n';

describe('ColorPicker test suite', () => {
  const contentBlocks = convertFromHTML('<div>test</div>');
  const contentState = ContentState.createFromBlockArray(contentBlocks);
  const editorState = EditorState.createWithContent(contentState);

  it('should have a div when rendered', () => {
    expect(mount(
      <ColorPicker
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.colorPicker}
        translations={localeTranslations.en}
        modalHandler={new ModalHandler()}
      />,
    ).html().startsWith('<div')).to.equal(true);
  });

  it('should render collapsed by default (no modal visible)', () => {
    const control = mount(
      <ColorPicker
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.colorPicker}
        translations={localeTranslations.en}
        modalHandler={new ModalHandler()}
      />,
    );
    // When collapsed, the color picker modal should not be rendered
    expect(control.find('.rdw-colorpicker-modal').length).to.equal(0);
  });

  it('should toggle expansion when modalHandler callbacks fire', () => {
    const modalHandler = new ModalHandler();
    const control = mount(
      <ColorPicker
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.colorPicker}
        translations={localeTranslations.en}
        modalHandler={modalHandler}
      />,
    );
    // Simulate: click option (sets signal), then modalHandler fires expandCollapse
    control.find('Option').simulate('click');
    // Trigger the registered callback (expandCollapse)
    modalHandler.closeAllModals();
    control.update();
    expect(control.find('.rdw-colorpicker-modal').length).to.equal(1);
  });
});
