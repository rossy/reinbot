"use strict";
var fs = require("fs");

exports.init = function(bot, dispatcher, loadavg) {
	dispatcher.emit("addResponses", loadavg.responses = [
		{ action: "loadavg", group: ["owner"], func: function(source) {
			fs.readFile("/proc/loadavg", function(err, data) {
				if (err)
					source.mention("i don't know :(");
				else if(typeof data == "string")
					source.mention("load average is: " + data.replace(/\n/g, ""));
				else source.mention("load average is: " + data.toString().replace(/\n/g, ""));
			});
		} },
	]);
}
