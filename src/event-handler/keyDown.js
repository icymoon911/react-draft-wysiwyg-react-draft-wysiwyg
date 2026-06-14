/**
 * KeyDownHandler — instance-level keyboard event callback manager.
 *
 * Each Editor creates its own KeyDownHandler so that callbacks registered
 * by one editor instance never leak into another. This replaces the old
 * module-level singleton which shared a single `callBacks` array across
 * all editor instances on the page.
 */
export default class KeyDownHandler {
  callBacks = [];

  onKeyDown = (event: Object) => {
    this.callBacks.forEach((callBack) => {
      callBack(event);
    });
  };

  registerCallBack = (callBack): void => {
    this.callBacks.push(callBack);
  };

  deregisterCallBack = (callBack): void => {
    this.callBacks = this.callBacks.filter(cb => cb !== callBack);
  };

  /**
   * Clear all registered callbacks.
   * Called when the editor component unmounts to prevent stale closures.
   */
  destroy = (): void => {
    this.callBacks = [];
  };
}
