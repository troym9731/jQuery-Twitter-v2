'use strict';

var $ = require('jquery');
var templates = require('./template');
var usersUrl = 'http://localhost:3000/users/';
var tweetsUrl = 'http://localhost:3000/tweets/';
var repliesUrl = 'http://localhost:3000/replies/';

var User = {
    id: 1,
    handle: '@bradwestfall',
    img: '../images/brad.png'
};

var renderTweet = function(userId, message) {
    var tweetObj = {
        userId: userId,
        message: message
    }

    $.post(tweetsUrl, tweetObj)
        .done(function() {
            console.log('done');
        }).fail(function() {
            console.log('fail');
        });

    User.message = message;
    var tweet = templates.tmplTweet(User);
    var obj = {
        tweet: tweet
    };
    var thread = templates.tmplThread(obj)
    return thread;

}

var renderReply = function(userId, message, tweetId) {
    var replyObj = {
        userId: userId,
        tweetId: tweetId,
        message: message
    }

    $.post(repliesUrl, replyObj)
        .done(function() {
            console.log('done');
        }).fail(function() {
            console.log('fail');
        });

    User.message = message;
    var reply = templates.tmplTweet(User);
    return reply;
}

// Load initial threads from Database
var loadThreads = function() {
    $.get(tweetsUrl)
        .done(function(tweets) {
            tweets.forEach(function(tweet) {
                var userId = tweet.userId;
                var tweetId = tweet.id;
                var _tweet = tweet;
                $.get(usersUrl + userId)
                    .done(function(userInfo) {
                        _tweet.handle = userInfo.handle;
                        _tweet.img = userInfo.img;

                        var tweet = templates.tmplTweet(_tweet);
                        var obj = {
                            tweet: tweet
                        };

                        var thread = templates.tmplThread(obj);
                        $('#tweets').append(thread);

                    }).fail(function() {
                        console.log('fail');
                    })
            })
        // Get the Replies

        }).done(function() {
            $.get(repliesUrl)
                .done(function(replies) {
                    replies.forEach(function(reply) {
                        var userId = reply.userId;
                        var tweetId = reply.tweetId;
                        var _reply = reply;

                        $.get(usersUrl + userId)
                            .done(function(userInfo) {
                                _reply.handle = userInfo.handle;
                                _reply.img = userInfo.img;
                                var reply = templates.tmplTweet(_reply);

                                var $search = $('#tweet-' + tweetId);

                                $search.siblings('.replies').append(reply);
                            })
                    })
                }).fail(function() {
                    console.log('fail');
                })
        }).fail(function() {
            console.log('fail');
        });
}

$(function () {

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
    var $tweetSection = $('#tweets');

    $mainSection.on('click', 'button', function() {
        var $textarea = $(this).closest(composeClass).find('textarea');
        var message = $textarea.val();

        if ($(this).parents().is('header')) {
            var thread = renderTweet(User.id, message);
            $('#tweets').append(thread);
        } else {
            var stringId = $(this).closest('.replies').siblings('.tweet').attr('id');
            var len = stringId.length
            var tweetId = stringId.slice(len - 1, len);
            console.log(tweetId);

            var reply = renderReply(User.id, message, tweetId);
            $(this).closest('.replies').append(reply);
        }

        $textarea.val('');
        $(this).closest(composeClass).removeClass('expand');
        return false;
    });

});
