'use strict';

var SocketManager = require('./SocketManager'),
		timers = {};

/*
no timers to start.
other modules will register an interval to run their function.
if interval exists then function will get tossed in an array
of functions to run.

if interval does not exist, one is created and array built.

all functions should be async, maybe force it with async plugin
order doesn't matter
*/

module.exports.registerInterval = function (interval, callback) {

	if (!timers.hasOwnProperty("interval-" + interval)) {
		timers["interval-" + interval] = {};
		timers["interval-" + interval].callbacks = [callback];

		timers["interval-" + interval].interval = setInterval(function(){
			for (var i = 0; i < timers["interval-" + interval].callbacks.length; i++) {
			    timers["interval-" + interval].callbacks[i]();
			}
		}, interval);

	} else {
		timers["interval-" + interval].callbacks.push(callback);
	}
	
};

SocketManager.events.on('socket:connected', function(io){

});