'use strict';


var Relay = require("./relay"),
  SocketManager = require('./SocketManager'),
  Datastore = require('nedb'),
  Timer = require('./timer'),
  pumpDB = new Datastore({filename: 'server/pump.db', autoload:true}),
  _ = require('underscore'),
  Pump = {},
  pumps = [];

var sio;

var findPumpAndAdd = function (num, pin, relay) {
  pumpDB.findOne({pin: pin}, function(err, doc) {
    if (!doc) {
      addPumpToDb(num, pin, relay);
    } 
  });
};

var addPumpToDb = function (num, pin, relay) {
  var pump = {
    number: num,
    pump_rate: 100,
    amount: 0,
    on: false,
    pin: pin,
    relay: relay,
    label: 'pump ' + num,
    time: {on: {time: '', string: ''}}
  };
  pumpDB.insert(pump);
};

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

var getTime = function () {

    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    return hour + ":" + min;
}

var registerTimers = function () {
  Timer.registerInterval(60000, function(){
    console.log('here', getTime());
    pumpDB.find({"time.on.time": getTime()}, function (err, docs){
      for (var i = 0; i < docs.length; i++) {
        if (!docs[i].on) {
          Pump.turnOn(parseInt(docs[i].number), function(id){
            pumpDB.find({number: parseInt(id)}, function (err, docs){
              var timeToOff = (docs[0].amount/docs[0].pump_rate) * 60000;
              setTimeout(function(id){
                Pump.turnOff(docs[0].number);
              }, timeToOff);
            });
          });
        }
      }
    });
  });
};

Pump.init = function(pins) {
  for (var i = 0; i<pins.length; i++) {
    pumps.push(new Relay(parseInt(pins[i])));
    findPumpAndAdd(i, pins[i], pumps[i]);
  }
  registerTimers();
};

Pump.turnOn = function(id, callback){
  pumps[id].turnOnOutlet(function(){
    if (typeof sio === 'object') {
      sio.emit('response:pump:on', {pump: id});
      sio.broadcast.emit('response:pump:on', {pump: id});
    }
    pumpDB.update({number: parseInt(id)},
      {
        $set: {
          'on': true
      }
    });
  });
  if (typeof callback === "function") {
    callback(id);
  }
};

Pump.turnOff = function(id, callback){
  pumps[id].turnOffOutlet(function(){
    if (typeof sio === 'object') {
      sio.emit('response:pump:off', {pump:id});
      sio.broadcast.emit('response:pump:off', {pump: id});
    }
    pumpDB.update({number: parseInt(id)},
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
    pumpDB.find({}, function (err, docs) {
      socket.emit('load:pumps', { pumps: docs.sort(dynamicSort("number")) });
    });
  
    socket.on('toggle:pump:on', function(data) {
      Pump.turnOn(parseInt(data.pump));
    });
  
    socket.on('toggle:pump:off', function(data) {
      Pump.turnOff(parseInt(data.pump));
    });

    socket.on('pump:update', function(data){
      pumpDB.update({number: parseInt(data.pump)},
        {
          $set: {
            'label': data.label,
            'time.on.string': data.time.on.string,
            'time.on.time': data.time.on.time,
            'amount': data.amount
          }
        }, function(err){
          if (err === null) {
            socket.emit("pump:update:response", {success: true});
          }
        });
    });

  });
});

module.exports = Pump;
