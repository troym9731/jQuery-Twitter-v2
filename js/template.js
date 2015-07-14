'use strict';

var Handlebars = require('hbsfy/runtime');
var thread = require('../templates/thread.hbs');
var tweet = require('../templates/tweet.hbs');
var option = require('../templates/option.hbs');

module.exports = {
    tmplThread: thread,
    tmplTweet: tweet,
    tmplOption: option
};
