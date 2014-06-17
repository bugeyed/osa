'use strict';


var Relay = require("./relay"),
	SocketManager = require('./SocketManager'),
	OutletModel = require("../models/outlet"),
  Datastore = require('nedb'),
  outletDB = new Datastore({filename: 'server/outlets.db', autoload:true}),
  _ = require('underscore'),
	Outlet = {},
	outlets = [];

var findOutletAndAdd = function(num, pin, relay){
  outletDB.findOne({pin: pin}, function(err, doc) {
    if (!doc) {
      addOutletToDb(num, pin, relay);
    } 
  });
};

var addOutletToDb = function(num, pin, relay){
  var outlet = {
    number: num,
    pin: pin,
    relay: relay,
    label: 'outlet ' + num,
    time: {on: '', off: ''},
    data: {temp1: {on: 0, temp: 0}}
  };
  outletDB.insert(outlet);
};

Outlet.init = function(pins) {
  for (var i = 0; i<pins.length; i++) {
    outlets.push(new Relay(parseInt(pins[i])));
    findOutletAndAdd(i, pins[i], outlets[i]);
  }

};

Outlet.turnOn = function(id){
  outlets[id].turnOnOutlet();
};

Outlet.turnOff = function(id){
  outlets[id].turnOffOutlet();
};

SocketManager.events.on('socket:connected', function(io){
  io.sockets.on('connection', function(socket) {
    
    outletDB.find({}, function (err, docs) {
      socket.emit('load:outlets', { outlets: docs.sort(dynamicSort("number")) });
    });
  
    socket.on('toggle:outlet:on', function(data) {
      Outlet.turnOn(parseInt(data.outlet));
    });
  
    socket.on('toggle:outlet:off', function(data) {
      Outlet.turnOff(parseInt(data.outlet));
    });
  
    socket.on('outlet:update', function(data){
      outletDB.update({number: parseInt(data.outlet)},
        {
          $set: {
            'time.on': data.time.on,
            'time.off': data.time.off
          }
        }, function(err){
          console.log(err)
          if (err === null) {
            socket.emit("outlet:update:response", {success: true});
          }
        });
    });
  });
});

module.exports = Outlet;

var dynamicSort = function(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}