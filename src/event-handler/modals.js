export default class ModalHandler {
  callBacks = [];
  suggestionCallback = undefined;
  editorFlag = false;
  suggestionFlag = false;
  wrapperId = undefined;

  // Store handlers as class properties so they can be removed later
  handleDocumentClick = (event: Object) => {
    const wrapper = this.wrapperId
      ? document.getElementById(this.wrapperId) // eslint-disable-line no-undef
      : null;
    // If click is inside our wrapper, use the editorFlag logic
    if (wrapper && wrapper.contains(event.target)) {
      if (!this.editorFlag) {
        this.closeAllModals();
        if (this.suggestionCallback) {
          this.suggestionCallback();
        }
      } else {
        this.editorFlag = false;
      }
      return;
    }
    // Click is outside our wrapper — close modals for this instance only
    this.closeAllModals();
    if (this.suggestionCallback) {
      this.suggestionCallback();
    }
  };

  handleDocumentKeyDown = (event: Object) => {
    if (event.key === 'Escape') {
      this.closeAllModals();
    }
  };

  handleWrapperClick = () => {
    this.editorFlag = true;
  };

  closeAllModals = (event: Object) => {
    this.callBacks.forEach((callBack) => {
      callBack(event);
    });
  };

  init = (wrapperId: string) => {
    this.wrapperId = wrapperId;
    const wrapper = document.getElementById(wrapperId); // eslint-disable-line no-undef
    if (wrapper) {
      wrapper.addEventListener('click', this.handleWrapperClick);
    }
    if (document) {
      document.addEventListener('click', this.handleDocumentClick); // eslint-disable-line no-undef
      document.addEventListener('keydown', this.handleDocumentKeyDown); // eslint-disable-line no-undef
    }
  };

  destroy = () => {
    const wrapper = this.wrapperId
      ? document.getElementById(this.wrapperId) // eslint-disable-line no-undef
      : null;
    if (wrapper) {
      wrapper.removeEventListener('click', this.handleWrapperClick);
    }
    if (document) {
      document.removeEventListener('click', this.handleDocumentClick); // eslint-disable-line no-undef
      document.removeEventListener('keydown', this.handleDocumentKeyDown); // eslint-disable-line no-undef
    }
    this.callBacks = [];
    this.suggestionCallback = undefined;
    this.editorFlag = false;
    this.suggestionFlag = false;
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
