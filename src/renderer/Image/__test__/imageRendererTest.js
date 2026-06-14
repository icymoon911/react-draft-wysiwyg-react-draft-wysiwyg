/* @flow */

import React from "react";
import { expect } from "chai";
import { shallow, mount } from "enzyme";
import { getAllBlocks } from "draftjs-utils";
import {
  convertFromHTML,
  AtomicBlockUtils,
  ContentState,
  EditorState,
} from "draft-js";

import getImageComponent from "../index";

describe("ImageRenderer test suite", () => {
  const contentBlocks = convertFromHTML("<div>test</div>");
  const contentState = ContentState.createFromBlockArray(contentBlocks);
  const editorState = EditorState.createWithContent(contentState);
  const entityKey = contentState
    .createEntity("IMAGE", "MUTABLE", { src: "testing" })
    .getLastCreatedEntityKey();
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(
    editorState,
    entityKey,
    " "
  );

  it("should have a span when rendered", () => {
    const Image = getImageComponent({
      isReadOnly: () => false,
      isImageAlignmentEnabled: () => true,
    });
    expect(
      mount(
        <Image
          block={getAllBlocks(newEditorState).get(1)}
          contentState={contentState}
        />
      )
        .childAt(0)
        .type()
    ).to.equal("span");
  });

  it("should render with alignment options hidden by default", () => {
    const Image = getImageComponent({
      isReadOnly: () => false,
      isImageAlignmentEnabled: () => true,
    });
    const control = shallow(
      <Image
        block={getAllBlocks(newEditorState).get(1)}
        contentState={contentState}
      />
    );
    // Alignment options should not be visible until hover
    expect(control.find('.rdw-image-alignment-options-popup').length).to.equal(0);
  });

  it("should have 1 child element by default", () => {
    const Image = getImageComponent({
      isReadOnly: () => false,
      isImageAlignmentEnabled: () => true,
    });
    const control = shallow(
      <Image
        block={getAllBlocks(newEditorState).get(1)}
        contentState={contentState}
      />
    );
    expect(control.children().length).to.equal(1);
  });
});
