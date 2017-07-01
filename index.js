'use strict';

var Alexa = require("alexa-sdk");
var xml2js = require('xml2js');
var request = require('request');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function() {
        this.emit('calculate');
    },
    'GetCountryGDPIntent': function() {
        this.emit('calculate')
    },
    'calculate': function() {
        var request = require('request');
        request('http://api.worldbank.org/countries/us/indicators/NY.GDP.MKTP.CD?date=2016:2016', function (error, response, body) {
            console.log('body:', body);
            //parser.parseString(body);
        });
    }
};

function complete() {
    this.emit(':tell', 'Hello new World!');
}
