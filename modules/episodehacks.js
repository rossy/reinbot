"use strict";

var http = require("http");

//Monkey-patching the String library to add these fun functions :D
//link: http://rickyrosario.com/blog/javascript-startswith-and-endswith-implementation-for-strings/
String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

exports.init = function(bot, dispatcher, loadavg, responses) {
    dispatcher.emit("addResponses", loadavg.responses = [
		{ command: "todaysep", func: function(source) {
            source.mention("The Great and Powerful Trixie has PM'd");
            source.message("Your links:");
            source.message("1080p youtube rip: http://jumbofiles.com/l3n3gan9z61g");
            source.message("720p iTunes rip DDL: http://jumbofiles.com/s2lqemlbsu7m");
            source.message("720p iTunes rip Torrent: http://torcache.net/torrent/2710E9FC4B5F11E31D0BE9F0E4666718ECC7C6A5.torrent");
            source.message("If you DDL, please seed.");
        } },
        
        { command: "rdpresents", func: function(source) {
            source.message("https://torrents.thepiratebay.se/7110859/Rainbow_Dash_Presents_.7110859.TPB.torrent");
        } },
    ]);
}
