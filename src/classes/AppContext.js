import React, {useState} from "react";

export default class AppContext {
  value;
  /**
   * @type {React.Component[]}
   * @memberof AppContext
   */
  functionalConsumers = [];
  classConsumers = [];
  constructor(defaultValue) {
    console.log("AppContext created");
    this.value = defaultValue;
  };

  use(self) {
    const [, setValue] = React.useState.bind(self)(this.value);
    this.functionalConsumers.push(setValue.bind(self));
    return this.value;
  }

  /**
   * Set the value of the context
   * @param  {any} value 
   * @param  {(newValue, oldValue)=>bool} equal 
   * @return {void}
   * @memberof AppContext
   */
  provide(value, equal) {
    const isEqual = equal ? equal(value, this.value) : Object.is(value, this.value);
    if (!isEqual) {
      console.log("provided new value of " + value);
      this.value = value;
      this.functionalConsumers.forEach(setValue => {
        setValue(this.value);
      });
    }
  }
}