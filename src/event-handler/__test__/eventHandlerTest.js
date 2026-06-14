import { expect } from "chai";
import sinon from "sinon";
import ModalHandler from "../../event-handler/modals";
import FocusHandler from "../../event-handler/focus";
import KeyDownHandler from "../../event-handler/keyDown";

describe("ModalHandler test suite", () => {
  let handler;

  beforeEach(() => {
    handler = new ModalHandler();
    // Create a wrapper element in jsdom for init() to attach to
    const wrapper = document.createElement("div");
    wrapper.id = "test-wrapper-1";
    document.body.appendChild(wrapper);
  });

  afterEach(() => {
    if (handler) handler.destroy();
    // Clean up DOM
    const el = document.getElementById("test-wrapper-1");
    if (el) el.parentNode.removeChild(el);
    const el2 = document.getElementById("test-wrapper-2");
    if (el2) el2.parentNode.removeChild(el2);
  });

  it("should register and invoke callbacks via closeAllModals", () => {
    const cb = sinon.spy();
    handler.registerCallBack(cb);
    handler.closeAllModals();
    expect(cb.calledOnce).to.equal(true);
  });

  it("should deregister a specific callback", () => {
    const cb1 = sinon.spy();
    const cb2 = sinon.spy();
    handler.registerCallBack(cb1);
    handler.registerCallBack(cb2);
    handler.deregisterCallBack(cb1);
    handler.closeAllModals();
    expect(cb1.called).to.equal(false);
    expect(cb2.calledOnce).to.equal(true);
  });

  it("should clear all callbacks on destroy", () => {
    const cb = sinon.spy();
    handler.registerCallBack(cb);
    handler.init("test-wrapper-1");
    handler.destroy();
    handler.closeAllModals();
    expect(cb.called).to.equal(false);
  });

  it("should remove document click listener on destroy so clicks no longer trigger closeAllModals", () => {
    const cb = sinon.spy();
    handler.registerCallBack(cb);
    handler.init("test-wrapper-1");

    // Before destroy — a click on document body (outside the wrapper) should close modals
    const event = new window.Event("click", { bubbles: true });
    document.body.dispatchEvent(event);
    expect(cb.calledOnce).to.equal(true);

    handler.destroy();
    cb.resetHistory();

    // After destroy — a click on document body should NOT trigger closeAllModals
    const event2 = new window.Event("click", { bubbles: true });
    document.body.dispatchEvent(event2);
    expect(cb.called).to.equal(false);
  });

  it("should remove document keydown listener on destroy", () => {
    const cb = sinon.spy();
    handler.registerCallBack(cb);
    handler.init("test-wrapper-1");

    // Press Escape — should close modals
    const escEvent = new window.KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escEvent);
    expect(cb.calledOnce).to.equal(true);

    handler.destroy();
    cb.resetHistory();

    // After destroy, Escape should NOT trigger closeAllModals
    const escEvent2 = new window.KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escEvent2);
    expect(cb.called).to.equal(false);
  });

  describe("multi-instance isolation", () => {
    let handlerA;
    let handlerB;

    beforeEach(() => {
      // Create second wrapper
      const wrapper2 = document.createElement("div");
      wrapper2.id = "test-wrapper-2";
      document.body.appendChild(wrapper2);

      handlerA = new ModalHandler();
      handlerB = new ModalHandler();
      handlerA.init("test-wrapper-1");
      handlerB.init("test-wrapper-2");
    });

    afterEach(() => {
      handlerA.destroy();
      handlerB.destroy();
      handlerA = null;
      handlerB = null;
    });

    it("clicking inside editor A should NOT close editor B modals via A's handler", () => {
      const cbA = sinon.spy();
      const cbB = sinon.spy();
      handlerA.registerCallBack(cbA);
      handlerB.registerCallBack(cbB);

      // Simulate a click inside wrapper A
      const wrapperA = document.getElementById("test-wrapper-1");
      const clickEvent = new window.MouseEvent("click", { bubbles: true });
      wrapperA.dispatchEvent(clickEvent);

      // After a click inside A, A's document handler sees the click inside its wrapper
      // and does NOT close A's modals. B's document handler sees the click outside B's wrapper
      // so it WILL close B's modals. That's the desired behavior.
      expect(cbA.called).to.equal(false);
      expect(cbB.calledOnce).to.equal(true);
    });

    it("clicking outside both editors should close modals on both", () => {
      const cbA = sinon.spy();
      const cbB = sinon.spy();
      handlerA.registerCallBack(cbA);
      handlerB.registerCallBack(cbB);

      // Click on body (outside both wrappers)
      const clickEvent = new window.MouseEvent("click", { bubbles: true });
      document.body.dispatchEvent(clickEvent);

      expect(cbA.calledOnce).to.equal(true);
      expect(cbB.calledOnce).to.equal(true);
    });

    it("destroying handler A should not affect handler B", () => {
      const cbA = sinon.spy();
      const cbB = sinon.spy();
      handlerA.registerCallBack(cbA);
      handlerB.registerCallBack(cbB);

      handlerA.destroy();

      // Click outside both editors — only B should fire
      const clickEvent = new window.MouseEvent("click", { bubbles: true });
      document.body.dispatchEvent(clickEvent);

      expect(cbA.called).to.equal(false);
      expect(cbB.calledOnce).to.equal(true);
    });

    it("creating and destroying many instances should not accumulate document listeners", () => {
      const callbacks = [];
      const handlers = [];
      for (let i = 0; i < 10; i++) {
        const h = new ModalHandler();
        const wrapper = document.createElement("div");
        wrapper.id = `test-wrapper-many-${i}`;
        document.body.appendChild(wrapper);
        h.init(`test-wrapper-many-${i}`);
        const cb = sinon.spy();
        h.registerCallBack(cb);
        callbacks.push(cb);
        handlers.push(h);
      }

      // Destroy all of them
      handlers.forEach((h) => h.destroy());

      // Click on body — none of the destroyed handlers should fire
      const clickEvent = new window.MouseEvent("click", { bubbles: true });
      document.body.dispatchEvent(clickEvent);
      callbacks.forEach((cb) => {
        expect(cb.called).to.equal(false);
      });

      // Clean up DOM
      for (let i = 0; i < 10; i++) {
        const el = document.getElementById(`test-wrapper-many-${i}`);
        if (el) el.parentNode.removeChild(el);
      }
    });
  });

  it("should set and clear suggestion callback", () => {
    const suggestionCb = sinon.spy();
    handler.setSuggestionCallback(suggestionCb);
    expect(handler.suggestionCallback).to.equal(suggestionCb);
    handler.removeSuggestionCallback();
    expect(handler.suggestionCallback).to.equal(undefined);
  });
});

describe("FocusHandler test suite", () => {
  let handler;

  beforeEach(() => {
    handler = new FocusHandler();
  });

  describe("isEditorBlur", () => {
    it("should return true when clicking a non-form element and inputFocused is false", () => {
      handler.inputFocused = false;
      const event = { target: { tagName: "DIV" } };
      const result = handler.isEditorBlur(event);
      expect(result).to.equal(true);
      expect(handler.editorFocused).to.equal(false);
    });

    it("should return false when clicking a non-form element and inputFocused is true", () => {
      handler.inputFocused = true;
      const event = { target: { tagName: "DIV" } };
      const result = handler.isEditorBlur(event);
      expect(result).to.equal(false);
    });

    it("should return true when clicking INPUT and editorFocused is false", () => {
      handler.editorFocused = false;
      const event = { target: { tagName: "INPUT" } };
      const result = handler.isEditorBlur(event);
      expect(result).to.equal(true);
      expect(handler.inputFocused).to.equal(false);
    });

    it("should return true when clicking LABEL and editorFocused is false", () => {
      handler.editorFocused = false;
      const event = { target: { tagName: "LABEL" } };
      const result = handler.isEditorBlur(event);
      expect(result).to.equal(true);
    });

    it("should return true when clicking TEXTAREA and editorFocused is false", () => {
      handler.editorFocused = false;
      const event = { target: { tagName: "TEXTAREA" } };
      const result = handler.isEditorBlur(event);
      expect(result).to.equal(true);
    });

    it("should return false when clicking INPUT and editorFocused is true", () => {
      handler.editorFocused = true;
      const event = { target: { tagName: "INPUT" } };
      const result = handler.isEditorBlur(event);
      expect(result).to.equal(false);
    });

    // This is the key test for the || vs && bug fix:
    // Previously, the second branch used || which made the condition always true,
    // so clicking a non-form element would ALWAYS trigger blur even when inputFocused was true.
    // After the fix (using &&), the second branch correctly requires ALL three checks to pass.
    it("BUG FIX: clicking SPAN with inputFocused=true should NOT trigger blur", () => {
      handler.inputFocused = true;
      const event = { target: { tagName: "SPAN" } };
      const result = handler.isEditorBlur(event);
      // The second branch condition: tagName !== 'INPUT' && !== 'LABEL' && !== 'TEXTAREA'
      // is true for SPAN, but inputFocused is true so !this.inputFocused is false → return false
      expect(result).to.equal(false);
    });

    it("BUG FIX: clicking INPUT with inputFocused=true and editorFocused=false should not match second branch", () => {
      // This tests that INPUT does NOT accidentally match the second branch condition
      handler.inputFocused = true;
      handler.editorFocused = false;
      const event = { target: { tagName: "INPUT" } };
      // First branch: INPUT matches, editorFocused=false → returns true
      const result = handler.isEditorBlur(event);
      expect(result).to.equal(true);
    });
  });

  describe("isEditorFocused", () => {
    it("should return true when inputFocused is false", () => {
      handler.inputFocused = false;
      expect(handler.isEditorFocused()).to.equal(true);
    });

    it("should return false and reset inputFocused when inputFocused is true", () => {
      handler.inputFocused = true;
      expect(handler.isEditorFocused()).to.equal(false);
      expect(handler.inputFocused).to.equal(false);
    });
  });

  describe("isToolbarFocused", () => {
    it("should return true when editorFocused is false", () => {
      handler.editorFocused = false;
      expect(handler.isToolbarFocused()).to.equal(true);
    });

    it("should return false and reset editorFocused when editorFocused is true", () => {
      handler.editorFocused = true;
      expect(handler.isToolbarFocused()).to.equal(false);
      expect(handler.editorFocused).to.equal(false);
    });
  });

  describe("destroy", () => {
    it("should reset all focus state", () => {
      handler.inputFocused = true;
      handler.editorMouseDown = true;
      handler.editorFocused = true;
      handler.destroy();
      expect(handler.inputFocused).to.equal(false);
      expect(handler.editorMouseDown).to.equal(false);
      expect(handler.editorFocused).to.equal(false);
    });
  });

  describe("onEditorMouseDown / onInputMouseDown", () => {
    it("should set editorFocused on editor mouse down", () => {
      handler.onEditorMouseDown();
      expect(handler.editorFocused).to.equal(true);
    });

    it("should set inputFocused on input mouse down", () => {
      handler.onInputMouseDown();
      expect(handler.inputFocused).to.equal(true);
    });
  });
});

describe("KeyDownHandler test suite", () => {
  describe("instance isolation", () => {
    it("should not share callbacks between instances", () => {
      const handlerA = new KeyDownHandler();
      const handlerB = new KeyDownHandler();

      const cbA = sinon.spy();
      const cbB = sinon.spy();
      handlerA.registerCallBack(cbA);
      handlerB.registerCallBack(cbB);

      // Fire event on handler A only
      const event = { key: "a" };
      handlerA.onKeyDown(event);

      expect(cbA.calledOnce).to.equal(true);
      expect(cbB.called).to.equal(false);

      // Fire event on handler B only
      handlerB.onKeyDown(event);
      expect(cbA.calledOnce).to.equal(true); // still once, not twice
      expect(cbB.calledOnce).to.equal(true);

      handlerA.destroy();
      handlerB.destroy();
    });

    it("should allow deregistering a callback from the correct instance only", () => {
      const handlerA = new KeyDownHandler();
      const handlerB = new KeyDownHandler();

      const sharedCb = sinon.spy();
      handlerA.registerCallBack(sharedCb);
      handlerB.registerCallBack(sharedCb);

      handlerA.deregisterCallBack(sharedCb);

      const event = { key: "x" };
      handlerA.onKeyDown(event);
      handlerB.onKeyDown(event);

      // A deregistered, so A should not fire; B still has it
      expect(sharedCb.calledOnce).to.equal(true);
      expect(sharedCb.firstCall.args[0]).to.deep.equal(event);

      handlerA.destroy();
      handlerB.destroy();
    });
  });

  describe("destroy", () => {
    it("should clear all callbacks", () => {
      const handler = new KeyDownHandler();
      const cb = sinon.spy();
      handler.registerCallBack(cb);
      handler.destroy();
      handler.onKeyDown({ key: "a" });
      expect(cb.called).to.equal(false);
    });
  });

  describe("registerCallBack / deregisterCallBack", () => {
    it("should register and invoke multiple callbacks", () => {
      const handler = new KeyDownHandler();
      const cb1 = sinon.spy();
      const cb2 = sinon.spy();
      handler.registerCallBack(cb1);
      handler.registerCallBack(cb2);

      const event = { key: "Enter" };
      handler.onKeyDown(event);

      expect(cb1.calledOnce).to.equal(true);
      expect(cb1.calledWith(event)).to.equal(true);
      expect(cb2.calledOnce).to.equal(true);

      handler.destroy();
    });

    it("should deregister a callback so it is no longer invoked", () => {
      const handler = new KeyDownHandler();
      const cb = sinon.spy();
      handler.registerCallBack(cb);
      handler.deregisterCallBack(cb);
      handler.onKeyDown({ key: "a" });
      expect(cb.called).to.equal(false);
      handler.destroy();
    });
  });
});
