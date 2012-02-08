"use strict";
var path = require("path");

exports.init = function(bot, dispatcher, respond, config) {
	var responses = [];
	var actions = [];
	var commands = [];
	
	actions.lsmod = { action: "lsmod", group: ["owner", "authed"], func: function(source, argv) {
		source.mention(bot.modules.map(function(module) { return module.name; }).join(", "));
	} };
	
	actions.load = { action: "load", group: ["owner", "authed"], func: function(source, argv) {
		if (!argv[1])
		{
			source.mention("please specify a module to load");
			return;
		}
		argv.shift();
		
		argv.forEach(function(arg) {
			if (!path.existsSync(reinbot_path + "/modules/" + arg + ".js"))
			{
				source.mention(arg + " doesn't exist");
				return;
			}
			
			bot.reload(arg);
		});
		source.mention("successfully loaded!");
	} };
	
	actions.reload = { action: "reload", group: ["owner", "authed"], func: function(source, argv) {
		if (!argv[1])
		{
			source.mention("please specify a module to reload");
			return;
		}
		argv.shift();
		
		argv.forEach(function(arg) {
			if (!path.existsSync(reinbot_path + "/modules/" + arg + ".js"))
			{
				source.mention(arg + " doesn't exist");
				return;
			}
			
			bot.reload(arg);
		});
		source.mention("successfully reloaded!");
	} };
	
	if (!bot.responses)
		bot.responses = {};
	if (!bot.responses.group)
		bot.responses.group = {};
	
	function addResponse(response)
	{
		if (response.action)
			if (response.action instanceof RegExp)
				actions.push(response);
			else
				actions[response.action] = response;
		else if (response.command)
			commands[response.command] = response;
	}
	
	function doRespond(response, source, arg1, arg2)
	{
		var authed = true;
		
		if (response.group)
			authed = response.group.some(function(group) {
				return bot.responses.group[group].some(function(user) {
					if (source.toString().match(user))
						return true;
					return false;
				});
			});
		
		if (!authed)
		{
			dispatcher.emit("respond/unauthed", source, arg1, arg2);
			return;
		}
		
		bot.irc.lastChannel = source.from;
		if (response.func)
			response.func(source, arg1, arg2);
	}
	
	bot.modules.forEach(function(module) {
		if (module.obj.responses)
			module.obj.responses.forEach(addResponse);
	});
	
	dispatcher.on("irc/privMsg", function(source, msg) {
		if (source.from == bot.irc.currentNick ||
			(msg.substr(0, bot.irc.currentNick.length) == bot.irc.currentNick &&
			msg.substr(bot.irc.currentNick.length, 1).match(/[,;: ]/)))
		{
			var message = msg.substr((source.from == bot.irc.currentNick ? 0 : bot.irc.currentNick.length + 1)).replace(/^\s+|\s+$/g, "");
			var argv = message.split(" ");
			var m;
			
			if (actions[argv[0]])
			{
				doRespond(actions[argv[0]], source, argv, message);
				return;
			}
			else for (var i = 0; i < actions.length; i ++)
				if (m = message.match(actions[i].action))
				{
					doRespond(actions[i], source, message, m);
					return;
				}
			
			source.respond("i don't know how to " + message.replace(/your/g, "my"));
		}
		else if (bot.responses.prefix &&
			msg.substr(0, bot.responses.prefix.length) == bot.responses.prefix)
		{
			var message = msg.substr(bot.responses.prefix.length).replace(/\s+$/g, "");
			var argv = message.split(" ");
			
			if (commands[argv[0]])
				doRespond(commands[argv[0]], source, argv, message);
		}
	});
	
	dispatcher.on("addResponses", function(responses) {
		responses.forEach(addResponse);
	});
};
