'use strict';

var Alexa = require("alexa-sdk");
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
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
        request(
            { method: 'GET'
             , uri: 'http://api.worldbank.org/countries/us/indicators/NY.GDP.MKTP.CD?date=2016:2016'
             , gzip: true
            }
            , function (error, response, body) {
                // body is the decompressed response body
                //console.log('the decoded data is: ' + body);
                parser.parseString(body, function (err, result) {
                    complete(JSON.stringify(result['wb:data']['wb:data'][0]['wb:value'][0]));
                });
            }
        );
    }
};

function complete(value) {
    console.log(value);
    //this.emit(':tell', 'Hello new World! Data: ' + value);
}
