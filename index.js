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
var helpMessage = "Ask me what the GDP is of any country in the world.";
var handlers = {
    'AMAZON.HelpIntent': function() {
        myAlexa.emit(':tell', helpMessage);
    },
    'LaunchRequest': function() {
        this.emit('calculate');
    },
    'GetCountryGDPIntent': function() {
        this.emit('calculate')
    },
    'calculate': function() {
        myAlexa = this;
        var country = myAlexa.event.request.intent.slots.country.value;
        var countryShort = country.replace("the ", "")
        var countryCode = countrynames.getCode(countryShort);
        if (!countryCode) {
            countryCode = countryShort;
        }
        request({
            method: 'GET',
            uri: 'http://api.worldbank.org/countries/' + countryCode + '/indicators/NY.GDP.MKTP.CD?date=2016:2016',
            gzip: true
        }, function(error, response, body) {
            if (error) {
                myAlexa.emit(':tell', "Sorry, I'm having trouble connecting to my database. Please try again later.");
            }
            // body is the decompressed response body
            //console.log('the decoded data is: ' + body);
            parser.parseString(body, function(err, result) {
                if (err || result['wb:error']) { //Not a good way to find out
                    myAlexa.emit(':tell', "I couldn't find any data on " + country + ". Does it go by any other names?");
                } else {
                    var remoteValue = JSON.stringify(result['wb:data']['wb:data'][0]['wb:value'][0]);
                    remoteValue = remoteValue.substring(1, remoteValue.length - 1); //Removes quotes
                    var roundedValue = precisionRound(parseFloat(remoteValue), -9);
                    myAlexa.emit(':tell', 'The Gross Domestic Product of ' + country + ' is ' + roundedValue + '.');
                }
            });
        });
    },
    'Unhandled': function() {
        this.emit(':tell', helpMessage);
    }
};

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}
