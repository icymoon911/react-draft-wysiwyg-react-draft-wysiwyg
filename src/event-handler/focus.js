export default class FocusHandler {
  inputFocused = false;
  editorMouseDown = false;

  onEditorMouseDown = ():void => {
    this.editorFocused = true;
  }

  onInputMouseDown = ():void => {
    this.inputFocused = true;
  }

  isEditorBlur = (event): void => {
    if (
      (event.target.tagName === 'INPUT' || event.target.tagName === 'LABEL' || event.target.tagName === 'TEXTAREA') &&
      !this.editorFocused
    ) {
      this.inputFocused = false;
      return true;
    } else if (
      (event.target.tagName !== 'INPUT' && event.target.tagName !== 'LABEL' && event.target.tagName !== 'TEXTAREA') &&
      !this.inputFocused
    ) {
      this.editorFocused = false;
      return true;
    }
    return false;
  };

  isEditorFocused = ():void => {
    if (!this.inputFocused) {
      return true;
    }
    this.inputFocused = false;
    return false;
  }

  isToolbarFocused = ():void => {
    if (!this.editorFocused) {
      return true;
    }
    this.editorFocused = false;
    return false;
  }

  isInputFocused = ():void => this.inputFocused;

  /**
   * Reset all internal focus state.
   * Called when the editor component unmounts to avoid stale state leaks.
   */
  destroy = (): void => {
    this.inputFocused = false;
    this.editorMouseDown = false;
    this.editorFocused = false;
  }
}
