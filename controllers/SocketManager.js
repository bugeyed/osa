'use strict';

var	SocketIO = require('socket.io'),
		EventEmitter = require('events').EventEmitter,
		Sockets = {};

var io;

Sockets.init = function(server) {
	io = SocketIO.listen(server);

	Sockets.server = io;
	this.events.emit('socket:connected', io);
};

Sockets.events = new EventEmitter();

module.exports = Sockets;
