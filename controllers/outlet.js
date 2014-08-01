'use strict';


var Relay = require("./relay"),
	SocketManager = require('./SocketManager'),
	OutletModel = require("../models/outlet"),
  Datastore = require('nedb'),
  Timer = require('./timer'),
  outletDB = new Datastore({filename: 'server/outlets.db', autoload:true}),
  _ = require('underscore'),
	Outlet = {},
	outlets = [];

var sio;

var findOutletAndAdd = function (num, pin, relay) {
  outletDB.findOne({pin: pin}, function(err, doc) {
    if (!doc) {
      addOutletToDb(num, pin, relay);
    } 
  });
};

var addOutletToDb = function (num, pin, relay) {
  var outlet = {
    number: num,
    on: false,
    pin: pin,
    relay: relay,
    label: 'outlet ' + num,
    time: {on: {time: '', string: ''}, off: {time: '', string: ''}},
    data: {temp1: {on: 0, temp: 0}}
  };
  outletDB.insert(outlet);
};


var getTime = function () {

    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    return hour + ":" + min;
}

var registerTimers = function () {
  Timer.registerInterval(1000, function(){
    outletDB.find({"time.on": getTime()}, function (err, docs){
      for (var i = 0; i < docs.length; i++) {
        if (!docs[i].on) {
          Outlet.turnOn(parseInt(docs[i].number));
        }
      }
    });
    outletDB.find({"time.off": getTime()}, function (err, docs){
      for (var i = 0; i < docs.length; i++) {
        if (docs[i].on) {
          Outlet.turnOff(parseInt(docs[i].number));
        }
      }
    });
  });
};

Outlet.init = function(pins) {
  for (var i = 0; i<pins.length; i++) {
    outlets.push(new Relay(parseInt(pins[i])));
    findOutletAndAdd(i, pins[i], outlets[i]);
  }
  registerTimers();
};

Outlet.turnOn = function(id, callback){
  outlets[id].turnOnOutlet(function(){
    if (typeof sio === 'object') {
      sio.emit('response:outlet:on', {outlet:id});
      sio.broadcast.emit('response:outlet:on', {outlet: id});
    }
    outletDB.update({number: parseInt(id)},
      {
        $set: {
          'on': true
      }
    });
  });
};

Outlet.turnOff = function(id, callback){
  outlets[id].turnOffOutlet(function(){
    if (typeof sio === 'object') {
      sio.emit('response:outlet:off', {outlet:id});
      sio.broadcast.emit('response:outlet:off', {outlet: id});
    }
    outletDB.update({number: parseInt(id)},
      {
        $set: {
          'on': false
        }
      });
    });
};

SocketManager.events.on('socket:connected', function(io){
  io.sockets.on('connection', function(socket) {
    sio = socket;
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
