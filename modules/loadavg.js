"use strict";
var fs = require("fs");

exports.init = function(bot, dispatcher, loadavg) {
	dispatcher.emit("addResponses", loadavg.responses = [
		{ action: "loadavg", func: function(source) {
			fs.readFile("/proc/loadavg", function(err, data) {
				if (err)
					source.mention("i don't know :(");
				else source.mention(data.toString().replace(/\n/g, ""));
			});
		} },
	]);
}
