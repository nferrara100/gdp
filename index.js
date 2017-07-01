'use strict';

var Alexa = require("alexa-sdk");
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require('request');
var countrynames = require('countrynames');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var myAlexa;
var country;

var handlers = {
    'LaunchRequest': function() {
        this.emit('calculate');
    },
    'GetCountryGDPIntent': function() {
        this.emit('calculate')
    },
    'calculate': function() {
        myAlexa = this;
        country = myAlexa.event.request.intent.slots.country.value;
        var countryCode = countrynames.getCode(country);
        request(
            { method: 'GET'
             , uri: 'http://api.worldbank.org/countries/' + countryCode + '/indicators/NY.GDP.MKTP.CD?date=2016:2016'
             , gzip: true
            }
            , function (error, response, body) {
                // body is the decompressed response body
                //console.log('the decoded data is: ' + body);
                parser.parseString(body, function (err, result) {
                    var remoteValue = JSON.stringify(result['wb:data']['wb:data'][0]['wb:value'][0]);
                    remoteValue = remoteValue.substring(1, remoteValue.length-1); //Removes quotes
                    var roundedValue = precisionRound(parseFloat(remoteValue), -9);
                    myAlexa.emit(':tell', 'The GDP of ' + country + ' is ' + roundedValue + '.');
                });
            }
        );
    }
};

function precisionRound (number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};

9
