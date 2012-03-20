"use strict";

exports.init = function(bot, dispatcher, loadavg, responses) {
    
    
    dispatcher.emit("addResponses", loadavg.responses = [
		{ command: "kick", func: function (source, args) {
            bot.irc.sendRaw("KICK " + source.from + " " + args[1], true);
            bot.irc.privMsg(args[1], "You were kicked from " + source.from + " by " + source.nick);
        } },
        
        { command: "opme", group: ["owner"], func: function (source) {
            bot.irc.sendRaw("MODE " + source.from + " +o " + source.nick, true);
            bot.on("irc/noPermissions", function(source) {
                source.message("I am not a channel operator in " + source.from);
            });
        } },
        
        { command: "t_mention", func: function (source) {
            source.mention("You asked?");
            bot.irc.sendRaw("MODE " + source.from + " +o " + source.nick, true);
        } }, 
    ]);
}

