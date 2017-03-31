'use strict';

/**
 * Meetup RSVP
 * Lambda Handler
 * 
 * Thin wrapper to make it easier to port application away from Lambda
 * 
 */

// Require Logic
var action = require('./action');

// Lambda Handler
module.exports.handler = function(event, context) {
  action.RSVP(event, function(error, response) {
    return context.done(error, response);
  }, context);
};