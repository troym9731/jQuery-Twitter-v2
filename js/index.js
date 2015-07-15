'use strict';

var $ = require('jquery');
var templates = require('./template');
var baseUrl = 'http://localhost:3000/';

var User = {
    id: 1,
    handle: '@bradwestfall',
    img: '../images/brad.png'
};

var fail = function() {
    console.log('fail');
}

var renderTweet = function(userId, message) {
    // Object to be posted to the server
    var tweetObj = {
        userId: userId,
        message: message
    };

    // Post object to the server
    $.post(baseUrl + 'tweets', tweetObj)
        .done(function(tweet){
            User.tweetId = tweet.id;
            User.message = message;

            var tweet = templates.tmplTweet(User);
            var obj = {
                tweet: tweet
            };
            var thread = templates.tmplThread(obj);
            $('#tweets').append(thread);
        }).fail(fail)
};

var renderReply = function(userId, message, tweetId) {
    // Object to be posted to the server
    var replyObj = {
        userId: userId,
        tweetId: tweetId,
        message: message
    };
    // Posting replyObj to the server
    $.post(baseUrl + 'replies', replyObj)
        .done(function() {
            console.log('done');
        }).fail(fail)

    User.message = message;
    var reply = templates.tmplTweet(User);
    return reply;
};

var getUsers = function() {
    return $.get(baseUrl + 'users');
}

var getTweets = function() {
    return $.get(baseUrl + 'tweets')
}

var getReplies = function() {
    return $.get(baseUrl + 'replies')
}

var appendTweets = function(tweets) {
    tweets
        .sort(function(a, b) {
            return a.id - b.id;
        })
        .forEach(function(tweet) {
            var tweetHtml = templates.tmplTweet(tweet);
            var obj = {
                tweet: tweetHtml
            };

            var thread = templates.tmplThread(obj);
            $('#tweets').append(thread);
        })
}

var getUserTweets = function(users) {
    getTweets()
        .done(function(tweets) {
            for (var i = 0; i < users.length; i++) {
                for(var j = 0; j < tweets.length; j++) {
                    if (users[i].id === tweets[j].userId) {
                        tweets[j].handle = users[i].handle;
                        tweets[j].img = users[i].img;
                        tweets[j].tweetId = tweets[j].id
                    }
                }
            }
            appendTweets(tweets);
        })
}

var appendReplies = function(replies) {
    replies
        .sort(function(a, b) {
            return a.id - b.id;
        })
        .forEach(function(reply) {
            var replyHtml = templates.tmplTweet(reply);

            var $search = $('#tweet-' + reply.tweetId);
            $search.siblings('.replies').append(replyHtml);

        })
}

var getUserReplies = function(users) {
    getReplies()
        .done(function(replies) {
            for (var i = 0; i < users.length; i++) {
                for(var j = 0; j < replies.length; j++) {
                    if (users[i].id === replies[j].userId) {
                        replies[j].handle = users[i].handle;
                        replies[j].img = users[i].img;
                    }
                }
            }
            appendReplies(replies);
        })
}

// Load initial threads from Database

var loadThreads = function() {
    getUsers()
        .done(getUserTweets)
        .done(getUserReplies)
}

// Get all Users and append to dropdown

var dropdown = function() {
    getUsers()
        .done(function(users) {
            users.forEach(function(user) {
                var option = templates.tmplOption(user);
                $('#users').append(option);
            })
        }).fail(fail)
};

$(function () {
    // Get Users to fill dropdown box
    dropdown();

    $('#users').on('change', function() {
        var id = $('option:selected').val();
        getUsers()
            .done(function(users) {
                users.forEach(function(user) {
                    if (id == user.id) {
                        User = {
                            id: user.id,
                            handle: user.handle,
                            img: user.img
                        }
                    }
                })
            }).fail(fail)
    });

    loadThreads();

    // Expand functions for textarea and threads

    var $mainSection = $('#main');
    var composeClass = '.compose';

    $mainSection.on('click', 'textarea', function() {
        $(this).closest(composeClass).addClass('expand');
    });

    $mainSection.on('click', '.thread > .tweet', function() {
        $(this).closest('.thread').toggleClass('expand');
    });

    // Function to trigger POST and GET requests when button is clicked

    $mainSection.on('click', 'button', function() {
        var $textarea = $(this).closest(composeClass).find('textarea');
        var message = $textarea.val();

        if ($(this).parents().is('header')) {
            renderTweet(User.id, message);
        } else {
            var stringId = $(this).closest('.replies').siblings('.tweet').attr('id');
            var len = stringId.length;
            var tweetId = stringId.slice(len - 1, len);

            var reply = renderReply(User.id, message, tweetId);
            $(this).closest('.replies').append(reply);
        }

        $textarea.val('');
        $(this).closest(composeClass).removeClass('expand');
        return false;
    });

});
