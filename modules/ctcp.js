"use strict";

exports.init = function(bot, dispatcher, ctcp, config) {
	dispatcher.on("irc/ctcp", function(source, msg, type) {
		var parts = msg.split(" ");
		var to = ( source.from == bot.irc.currentNick ? source.nick : ( source.from || source.nick ) );
		
		if (type == 'privmsg' && msg == 'VERSION')
			bot.irc.ctcp(to, msg + ' one little reinbot pony inside');

		if (type == 'privmsg' && msg == 'TIME')
			bot.irc.ctcp(to, msg + ' ' + new Date());
		
		if (parts[0] == 'PING' && type == 'privmsg')
			bot.irc.ctcp(to, msg);
			
	});
};	