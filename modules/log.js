"use strict";
var fs = require("fs");

exports.init = function (bot, dispatcher, log, config) {
	var logfile = fs.createWriteStream(config.logfile, {
		flags: "a",
		encoding: "utf-8",
	});
	
	dispatcher.on("irc/recv", function(msg) {
		logfile.write(Math.floor(Date.now() / 1000) + " " + msg + "\n");
	});
};
