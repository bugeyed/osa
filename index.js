'use strict';


var kraken = require('kraken-js'),
    SocketManager = require('./controllers/SocketManager'),
    Outlet = require('./controllers/outlet'),
    Pump = require('./controllers/pump'),
    app = {};


app.configure = function configure(nconf, next) {
    // Async method run on startup.
    next(null);
};


app.requestStart = function requestStart(server) {
    // Run before most express middleware has been registered.
};


app.requestBeforeRoute = function requestBeforeRoute(server) {
    // Run before any routes have been added.
};


app.requestAfterRoute = function requestAfterRoute(server) {
    // Run after all routes have been added.
    Outlet.init([17,18,22,23]);
    Pump.init([27,4]);
};


if (require.main === module) {
    kraken.create(app).listen(function (err, server) {
        if (err) {
            console.error(err.stack);
        }
        SocketManager.init(server);
    });
}


module.exports = app;

