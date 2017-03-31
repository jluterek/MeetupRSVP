'use strict';

var aws = require('aws-sdk');
var meetup = require('meetup-api')({
	key: process.env.MEETUP_API_KEY
});
aws.config.update({region: process.env.SERVERLESS_REGION});

module.exports.RSVP = (event, cb, context) => {
    console.log("Getting events for group " + event.MEETUP_GROUP);
    let parameters = {
        'rsvp' : 'none', //Avoid RSVPing multiple times
        'group_urlname' : event.MEETUP_GROUP //Limit to specific meetup group
    };
    meetup.getEvents(parameters, function(error, response) {
        if (error) {
            cb(error);
        }
        if (!error) {
            var eventPromises = [];
            for (let i = 0; i < response.results.length; i++) {
                var e = response.results[i];
                if (e.name.toUpperCase().includes(event.EVENT_KEY.toUpperCase())) //Update to REGEX if necessary, but includes cover most cases
                {
                    eventPromises.push(joinMeetupEvent(e));
                }
            }
            Promise.all(eventPromises).then(values => {
                console.log("FINISHED");
                cb(null, "SUCCESS");
            }).catch(reason => { 
                console.log(reason)
                cb(reason, "");
            });
        }
    });
};


function joinMeetupEvent(e) {
    //RSVP for event
    return new Promise((resolve, reject) => {
        let parameters = {
            'event_id' : e.id, //Avoid RSVPing multiple times
            'rsvp' : 'yes'
        };
        meetup.postRSVP(parameters, function(err, resp) {
            if (err) {
                reject(err);
            }
            else {
                console.log("RSVPed for " + e.name);
                resolve(resp);
            }
        });
    });
}