"use strict";

exports.init = function (bot, dispatcher, ns, config) {
	dispatcher.on("irc/notice", function(source, msg) {
		if (source.nick == "NickServ" && source.from == bot.irc.currentNick && config.pass)
			if (msg.match(/^This nickname is registered\./))
				bot.irc.privMsg("NickServ", "IDENTIFY " + config.pass);
			else if (msg.match(/^You are now identified for/))
				dispatcher.emit("ns/identified");
	});
};
