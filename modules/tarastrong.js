"use strict";

var http = require("http");

var url = {
    host: "twitter.com",
    path: "/status/user_timeline/tarastrong.json?count=1",
}

function getTaraTweet(source) {
    var ret = null;
    
    http.get(url, function(res) {
        res.on('data', function (chunk) {
            var user = JSON.parse(chunk).data;
            
        });
    }).on('error', function(e) {
        source.mention("Got error: " + e.message);
    });
    
    return ret;
}

exports.init = function(bot, dispatcher, loadavg, responses) {
    dispatcher.emit("addResponses", loadavg.responses = [
        { command: "tara", func: function (source) {
            //source.respond("Hello");
            //getTaraTweet(source);
        } },
    ]);
}
