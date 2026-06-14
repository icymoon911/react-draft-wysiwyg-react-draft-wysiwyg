export default class ModalHandler {
  callBacks = [];
  suggestionCallback = undefined;
  editorFlag = false;
  suggestionFlag = false;
  wrapperId = undefined;
  // Store bound handler references so they can be removed later
  _documentClickHandler = undefined;
  _documentKeyDownHandler = undefined;
  _wrapperClickHandler = undefined;

  closeAllModals = (event: Object) => {
    this.callBacks.forEach((callBack) => {
      callBack(event);
    });
  };

  init = (wrapperId: string) => {
    this.wrapperId = wrapperId;
    const wrapper = document.getElementById(wrapperId); // eslint-disable-line no-undef
    if (wrapper) {
      this._wrapperClickHandler = () => {
        this.editorFlag = true;
      };
      wrapper.addEventListener('click', this._wrapperClickHandler);
    }
    if (document) {
      this._documentClickHandler = (event) => {
        // Only react to clicks outside this editor's own wrapper.
        // This prevents multiple editor instances from interfering with each other:
        // a click inside editor A should not trigger editor B's document-click handler
        // to close B's modals — B's own wrapper-click will not have fired, so B's
        // editorFlag stays false, but we additionally verify the click target is
        // truly outside our wrapper before closing.
        const wrapperEl = document.getElementById(this.wrapperId); // eslint-disable-line no-undef
        if (wrapperEl && wrapperEl.contains(event.target)) {
          // Click was inside this editor — the wrapper click handler already set
          // editorFlag = true, so just reset it and skip closing.
          this.editorFlag = false;
          return;
        }
        // Click was outside this editor — close modals for this instance only.
        if (!this.editorFlag) {
          this.closeAllModals();
          if (this.suggestionCallback) {
            this.suggestionCallback();
          }
        } else {
          this.editorFlag = false;
        }
      };
      document.addEventListener('click', this._documentClickHandler); // eslint-disable-line no-undef

      this._documentKeyDownHandler = (event) => {
        if (event.key === 'Escape') {
          this.closeAllModals();
        }
      };
      document.addEventListener('keydown', this._documentKeyDownHandler); // eslint-disable-line no-undef
    }
  };

  /**
   * Remove all document-level event listeners and clear callbacks.
   * Must be called when the editor component unmounts to prevent
   * memory leaks and stale-listener interference between instances.
   */
  destroy = () => {
    if (document) {
      if (this._documentClickHandler) {
        document.removeEventListener('click', this._documentClickHandler); // eslint-disable-line no-undef
        this._documentClickHandler = undefined;
      }
      if (this._documentKeyDownHandler) {
        document.removeEventListener('keydown', this._documentKeyDownHandler); // eslint-disable-line no-undef
        this._documentKeyDownHandler = undefined;
      }
    }
    const wrapper = this.wrapperId && document.getElementById(this.wrapperId); // eslint-disable-line no-undef
    if (wrapper && this._wrapperClickHandler) {
      wrapper.removeEventListener('click', this._wrapperClickHandler);
      this._wrapperClickHandler = undefined;
    }
    this.callBacks = [];
    this.suggestionCallback = undefined;
  };

  onEditorClick = () => {
    this.closeModals();
    if (!this.suggestionFlag && this.suggestionCallback) {
      this.suggestionCallback();
    } else {
      this.suggestionFlag = false;
    }
  }

  closeModals = (event: Object): void => {
    this.closeAllModals(event);
  };

  registerCallBack = (callBack): void => {
    this.callBacks.push(callBack);
  };

  deregisterCallBack = (callBack): void => {
    this.callBacks = this.callBacks.filter(cb => cb !== callBack);
  };

  setSuggestionCallback = (callBack): void => {
    this.suggestionCallback = callBack;
  };

  removeSuggestionCallback = (): void => {
    this.suggestionCallback = undefined;
  };

  onSuggestionClick = ():void => {
    this.suggestionFlag = true;
  }
}
