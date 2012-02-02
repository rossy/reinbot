"use strict";
var https = require("https");

var numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
function makeNumber(num)
{
	return numbers[num] || num;
}

exports.init = function (bot, dispatcher, countdown, config) {
	var ponytime = 1325948400;
	var lastcheck = 0;
	
	function cdfunc(source, channel)
	{
		function cdstring(now, ponytime)
		{
			var ttnextep = ponytime - now;
			var auto = false;
			while (ttnextep < 0)
			{
				auto = true;
				ttnextep += 604800;
			}
			
			if (auto && ttnextep > 603300)
				return "it's airing right now you silly filly!";
			
			var days = Math.floor(ttnextep / 86400);
			var hours = Math.floor(ttnextep / 3600 - days * 24);
			var minutes = Math.floor(ttnextep / 60 - days * 1440 - hours * 60);
			var seconds = ttnextep - days * 86400 - hours * 3600 - minutes * 60;
			var retstr = "";
			
			if (days)
				retstr = "it's still " + makeNumber(days) + " day" + (days == 1 ? "" : "s") + (hours ? " and " + makeNumber(hours) + " hour" + (hours == 1 ? "" : "s") : "");
			else if (hours)
				retstr = "only " + makeNumber(hours) + " hour" + (hours == 1 ? "" : "s") + (minutes ? " and " + makeNumber(minutes) + " minute" + (minutes == 1 ? "" : "s") : "");
			else if (minutes)
				retstr = "only " + makeNumber(minutes) + " minute" + (minutes == 1 ? "" : "s") + (seconds ? " and " + makeNumber(seconds) + " second" + (seconds == 1 ? "" : "s") : "");
			else if (seconds)
				retstr = "only " + makeNumber(seconds) + " second" + (seconds == 1 ? "" : "s");
			else
				retstr = "less than a second";
			
			return retstr + " until the next episode!";
		}
		
		var now = new Date().getTime();
		
		if (now - lastcheck > 3600000)
		{
			https.get({
				host: "raw.github.com",
				path: "/gist/7c951c79891ae9ecde73",
			}, function(res) {
				res.setEncoding("utf8");
				res.on("data", function(chunk) {
					var dnow = new Date().getTime();
					var pt = parseInt(chunk);
					
					if (isNaN(pt))
						bot.irc.privMsg(channel, source.nick + ", " + cdstring(Math.round(dnow / 1000), ponytime));
					else
					{
						lastcheck = dnow;
						bot.irc.privMsg(channel, source.nick + ", " + cdstring(Math.round(dnow / 1000), pt));
					}
				});
			}).on("error", function(e) {
				bot.irc.privMsg(channel, source.nick + ", " + cdstring(Math.round(new Date().getTime() / 1000), ponytime));
			});
		}
		else
			bot.irc.privMsg(channel, source.nick + ", " + cdstring(Math.round(now / 1000), ponytime));
	}
	
	dispatcher.emit("addResponses", countdown.responses = [
		{ command: "cd", func: function(source, argv) {
			cdfunc(source, source.from);
		} },
	]);
};
