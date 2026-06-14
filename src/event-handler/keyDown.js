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

  reset = (): void => {
    this.callBacks = [];
  };
}
