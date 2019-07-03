import $ from "./Utils";

export default class Touch {
  touching = false;
  deltaPosition = { x: 0, y: 0 };
  firstTouchPosition;
  _history = [];
  lastTouchPosition;
  lastTouchTime = Date.now();
  getTotalDisplacement() {
    let o = {
      x: this._history[0].touch.pageX - this.firstTouchPosition.pageX,
      y: this._history[0].touch.pageY - this.firstTouchPosition.pageY
    };
    return o
  }

  getRecentDeltaPosition() {
    return {
      x: this._history[0].touch.pageX - this._history[1].touch.pageX,
      y: this._history[0].touch.pageY - this._history[1].touch.pageY
    }
  }

  getDeltaPosition() {
    return {
      x: this._history[0].touch.pageX - this._history[this._history.length - 1].touch.pageX,
      y: this._history[0].touch.pageY - this._history[this._history.length - 1].touch.pageY
    }
  }

  getDeltaTime() {
    return Date.now() - this._history[this._history.length - 1].time;
  }

  getVelocity() {
    const deltaPosition = this.getDeltaPosition();
    const deltaTime = this.getDeltaTime();
    let o = {
      x: deltaPosition.x / deltaTime,
      y: deltaPosition.y / deltaTime
    }
    return o;
  }

  /**
 * 
 * @param  {React.TouchEvent} touchEvent 
 * @return {void}
 * @memberof Touch
 */
  registerTouchMove(touchEvent) {
    this.lastTouchPosition = this.lastTouchPosition || touchEvent.touches[0];
    this.firstTouchPosition = this.firstTouchPosition || touchEvent.touches[0];
    const nowTime = Date.now();
    this.registerHistory({
      time: nowTime,
      touch: touchEvent.touches[0]
    })
  }

  registerTouchEnd(touchEvent) {
    this.touching = false;
  }
  /**
   * 
   * @param  {React.TouchEvent} touchEvent 
   * @return {void}
   * @memberof Touch
   */
  registerTouchStart(touchEvent) {
    this.touching = true;
    this.velocity = { x: 0, y: 0 };
    this.firstTouchPosition = touchEvent.touches[0];
    this.clearHistory();
    this.registerHistory({
      time: Date.now(),
      touch: touchEvent.touches[0]
    });
  }

  maximumHistoryCount = 3;
  registerHistory(obj) {
    this._history.unshift(obj);
    if (this._history.length > this.maximumHistoryCount) this._history.pop();
  }
  clearHistory() {
    this._history = []
  }

}