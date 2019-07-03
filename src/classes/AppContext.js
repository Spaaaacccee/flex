import React, {useState} from "react";

export default class AppContext {
  value;
  /**
   * @type {Map<React.Component, (obj)=>{}>}
   * @memberof AppContext
   */
  functionalConsumers = new Map();
  classConsumers = new Map();
  constructor(defaultValue) {
    this.value = defaultValue;
  };

  use(functionalComponent) {
    const [, setValue] = React.useState.bind(functionalComponent)(this.value);
    if(!this.functionalConsumers.has(functionalComponent)) {
      this.functionalConsumers.set(functionalComponent,setValue);
    }
    return this.value;
  }

  unuse(functionalComponent) {
    this.functionalConsumers.delete(functionalComponent);
  }

  setConsumer(classComponent) {
    
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
      this.functionalConsumers.forEach((value,key)=>{
        value && value(this.value);
      });
    }
  }
}