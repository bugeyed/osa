'use strict';


var gpio = require("gpio");

/*
function Relay(pin){
  Relay.init(pin);
};

Relay.init = function(pin){
  this.gpio = gpio.export(pin);
};


Relay.turnOnOutlet = function (id, callback) {
//  this.gpio.set();
};
*/


module.exports = function(pin){
  if (typeof pin === "function") {
    return;
  }
  var _gpio = gpio.export(pin);
  return {
    turnOnOutlet: function(){
      _gpio.set();
    },
    turnOffOutlet: function(){
      _gpio.set(0);
    }
  }
}

