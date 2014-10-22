'use strict';


var MosfetModel = require('../models/mosfet');


module.exports = function (app) {

    var model = new MosfetModel();


    app.get('/mosfet', function (req, res) {
        
        res.render('mosfet', model);
        
    });

};
