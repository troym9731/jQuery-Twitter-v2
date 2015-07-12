'use strict';

var $ = require('jquery');
var templates = require('./template');
var db = 'http://localhost:3000/';

var User = {
    id: 1,
    handle: '@bradwestfall',
    img: '../images/brad.png'
};

var renderTweet = function(userId, message, check) {
    var obj = {};
    var tweetObj = {
        userId: userId,
        message: message
    };

    console.log(tweetObj);

    if (check) {
        // tweetObj
        // $.post(db + 'replies')
    } else {
        $.post(db + 'tweets', tweetObj)
            .done(function() {
                $.get(db + 'tweets')
                    .done(function(tweets) {
                    var findTweet = tweets.length - 1;
                    var tweet = tweets[findTweet];
                    obj.tweet = tweet;
                    console.log(obj);
                    }).fail(function() {
                         console.log('fail');
                    })
            }).fail(function() {
              console.log('fail');
            });
    }

    console.log(obj);
    return obj;
}

var renderThread = function(userId, message, check) {
    check = 0;
    var obj = renderTweet(userId, message, check);
    console.log(obj);
    var thread = templates.tmplThread(obj);
    console.log(thread);

    return thread;
}

// Load initial threads from Database
var loadThreads = function() {
    $.get(db + 'tweets')
        .done(function(tweets) {
            tweets.forEach(function(tweet) {
                var userId = tweet.userId;
                var tweetId = tweet.id;
                var _tweet = tweet;
                $.get(db + 'users/' + userId)
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
        }).fail(function() {
            console.log('fail');
        });
}

var loadReplies = function(tweetId) {
    $.get(db + 'replies')
        .done(function(replies) {
            replies.forEach(function(reply) {
                if (tweetId === reply.tweetId) {
                    var userId = reply.userid;
                    var _reply = reply;
                    $.get(db + 'replies/' + userId)
                        .done(function(userInfo) {
                            _reply.handle = userInfo.handle;
                            _reply.img = userInfo.img;
                            var reply = templates.tmplTweet(_reply);
                        })
                }
            })
        })
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
        var check = 1;

        // ID counter

        // var tweetId = 100;
        // var replyId = 100;

        if ($(this).parents().is('header')) {
            var thread = renderThread(User.id, message, check);
            $($tweetSection).append(thread);
            // tweetId++;
        } else {
            var tweet = renderTweet(currentUser, message);
            $(this).closest('.replies').append(tweet);
            // replyId++;
        }

        $textarea.val('');
        $(this).closest(composeClass).removeClass('expand');
        return false;
    });

});
