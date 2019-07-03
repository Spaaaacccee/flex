import { EventEmitter } from "./Utils";
import { message } from 'antd';

export default class Momentum extends EventEmitter {
  /**
 * @type {"momentum" | "offset" | "controlled" | "targetedMomentum"}
 * @memberof Momentum
 */
  mode = "controlled";
  from;
  to;
  velocity = 0;
  value = 0;
  targets = [];
  errorMargin = 0.0001;
  intensity = 1;
  controlledValue = 0;

  performanceMode = false;

  calculateValue = (to, from, controlledValue) => {
    return controlledValue;
  }

  selectTarget = (to, from, velocity, value) => {
    return to;
  }

  /**
   * @properties {TweenArgs} args
   * @memberof Tween
   */
  constructor(args) {
    super();
    Object.assign(this, { ...new TweenArgs(), ...args });
    this._previousValue = this.value;
    this.controlledValue = this.value;
    this.startLoop();
  }

  _previousValue;
  _looping = false;

  startLoop() {
    this.broadcastValue();
    this._looping = true;
    this.loop();
  }

  stopLoop() {
    this._looping = false;
  }

  target = 0;

  _offsetConstant = null;
  offset = 0;

  _previousTime = Date.now();

  _previousDeltaTimesMaxLength = 50;
  _previousDeltaTimes = []
  performanceModeManager(deltaTime) {
    this._previousDeltaTimes.push(deltaTime < 1000 / 45);
    if (this._previousDeltaTimes.length > this._previousDeltaTimesMaxLength) this._previousDeltaTimes.shift();
    if (this._previousDeltaTimes.length >= this._previousDeltaTimesMaxLength) {
      const avg = this._previousDeltaTimes.reduce((prev, current) => prev + current, 0) / this._previousDeltaTimes.length;
      if (avg < 0.5) {
        if (!this.performanceMode) {
          this.performanceMode = true;
          message.warn("We simplified some animations because it seems your device is struggling to keep up");
        }
      };
    }
  }

  loop() {
    const timeNow = Date.now();
    this.performanceModeManager(timeNow - this._previousTime);
    if (this.mode !== "offset" && this._offsetConstant !== null) {
      this.value = this._offsetConstant + this.offset;
      this._offsetConstant = null;
      this.offset = 0;
    }
    if (this.mode !== "controlled") {
      this.controlledValue = this.value;
    }
    switch (this.mode) {
      case "offset":
        if (this._offsetConstant === null) {
          this._offsetConstant = this.value;
        }
        this.value = (this._offsetConstant + this.offset);
        break;
      case "momentum":
        this.momentum(timeNow - this._previousTime, this.selectTarget(this.to, this.from, this.velocity, this.value));
        break;
      case "targetedMomentum":
        this.momentum(timeNow - this._previousTime, this.target)
        break;
      case "controlled":
        this.value = this.calculateValue(this.to, this.from, this.controlledValue);
        break;
    }
    if (this._previousValue !== this.value) {
      this.broadcastValue();
      this._previousValue = this.value;
    }
    if (this._looping) {
      this._previousTime = timeNow;
      requestAnimationFrame(() => { this.loop() });
    }
  }

  momentum(deltaTime, target) {
    this.value = this.lerp(this.value, target, deltaTime * 0.02);
    if (!this.performanceMode) {
      this.value += this.velocity * deltaTime;
      this.velocity = this.velocity * 0.7;
    }
    if (this.performanceMode) {
      this.value = Math.min(Math.max(this.from, this.value), this.to);
    }
    if (Math.abs(this.value - target) < this.errorMargin) {
      this.value = target;
      this.controlledValue = target;
      this.mode = "controlled";
    }
    // this.velocity = this.lerp(this.velocity, (this.to - this.value), 1 / this.mass);
  }

  lerp(from, to, intensity = 0.5) {
    return from + (intensity * (to - from));
  }

  broadcastValue() {
    this.targets.forEach((target) => {
      if (this.performanceMode) {
        target(Math.min(Math.max(this.from, this.value), this.to));
      } else {
        target(this.value);
      }
    })
  }

  on(callback) {
    super.on("value", callback);
  }
}

export class TweenArgs {
  /**
   * @type {"momentum" | "offset" | "controlled" | "targetedMomentum"}
   * @memberof TweenArgs
   */
  mode = "controlled";
  value = 0;
  from = 0;
  to = 1;
  targets = [];
  intensity = 5;
  errorMargin = 0.01;
  selectTarget = (to, from, velocity, value) => {
    return to;
  };
  calculateValue = (to, from, controlledValue) => {
    return controlledValue;
  }
}