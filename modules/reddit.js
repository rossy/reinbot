"use strict";

var http = require("http");

function getUserInfo(username) {
    var res = {
        host: "www.reddit.com",
        path: "/user/" + username + "/about.json"
    };
    
    return res;
}

function getRedditInfo(username, source) {
    var options = getUserInfo(username);

    var ret = null;
    
    http.get(options, function(res) {
        res.on('data', function (chunk) {
            var user = JSON.parse(chunk).data;
            source.mention("Please see the PM");
            source.message("User:          " + user.name);
            source.message("Link Karma:    " + user.link_karma);
            source.message("Comment Karma: " + user.comment_karma);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
    
    return ret;
}

exports.init = function(bot, dispatcher, loadavg, responses) {
    dispatcher.emit("addResponses", loadavg.responses = [
		{ command: "lookup", func: function (source, args) {
            source.message(getRedditInfo(args[1], source));
        } },
    ]);
}
