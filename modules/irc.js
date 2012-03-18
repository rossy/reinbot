"use strict";

function Source(irc, nick, user, host)
{
	this.irc = irc;
	this.nick = nick;
	this.user = user;
	this.host = host;
}
Source.prototype.valueOf = Source.prototype.toString = function() {
	return this.nick + (this.host ? (this.user ? "!" + this.user : "") + "@" + this.host : "");
};
Source.fromString = function(irc, string) {
	var m = string.match(/^([^ !@]+)(?:(?:!([^ @]+))?@([^ ]+))?$/);
	if (m)
		return new Source(irc, m[1], m[2], m[3]);
	else
		return null;
};
Source.prototype.respond = function(msg) {
	if (this.from == this.irc.currentNick)
		this.irc.privMsg(this.nick, msg);
	else
		this.irc.privMsg(this.from || this.nick, msg);
};

Source.prototype.mention = function(msg) {
	if (this.from == this.irc.currentNick)
		this.irc.privMsg(this.nick, msg);
	else
		this.irc.privMsg(this.from || this.nick, this.nick + ", " + msg);
};

Source.prototype.message = function(msg) {
	this.irc.privMsg(this.nick, msg);
};
exports.Source = Source;

exports.init = function (bot, dispatcher, irc, config) {
	if (!irc.recvBuffer)
		irc.recvBuffer = "";
	if (!irc.sendBuffer)
		irc.sendBuffer = [];
	
	function pong(message)
	{
		irc.sendRaw("PONG :" + message, true);
	}
	
	function parseRaw(line)
	{
		var m;
		if (m = line.match(/^(?::([^ ]+) )?([^ ]+)(.*)?$/))
		{
			var source;
			var command = m[2];
			var args = [];
			var str = m[3];
			if (m[1])
				source = Source.fromString(irc, m[1]);
			while (str.length)
			{
				m = str.match(/ (?::(.*)|([^ ]+))(.*)$/);
				args.push(m[1] || m[2]);
				str = m[3];
			}
			
			switch (command)
			{
				case "001":
					dispatcher.emit("irc/registered");
					break;
				case "353":
					dispatcher.emit("irc/names");
					break;
				case "432":
					dispatcher.emit("irc/erroenusNick");
					break;
				case "433":
					if (config.nick instanceof Array)
						if (config.nick.length)
							irc.nick(config.nick.shift());
						else
							dispatcher.emit("irc/nickInUse");
					else
						dispatcher.emit("irc/nickInUse");
					break;
				case "NOTICE":
					source.from = args[0];
					dispatcher.emit("irc/notice", source, args[1]);
					break;
				case "PRIVMSG":
					source.from = args[0];
					dispatcher.emit("irc/privMsg", source, args[1]);
					break;
				case "PING":
					pong(args[0]);
					return false;
			}
		}
		return true;
	}
	
	dispatcher.on("data", function(data) {
		var lines = (irc.recvBuffer + data).split("\r\n");
		for (var i = 0; i < lines.length - 1; i ++)
		{
			dispatcher.emit("irc/recv", lines[i]);
			if (parseRaw(lines[i]) && config.log)
				console.log(Date.now() + " RECV " + lines[i]);
		}
		irc.recvBuffer = lines[lines.length - 1];
	});
	
	dispatcher.on("connect", function() {
		if (config.pass)
			irc.pass(config.pass);
		if (config.nick instanceof Array)
			irc.nick(config.nick.shift());
		else if (config.nick)
			irc.nick(config.nick);
		if (config.username) {
			var mode = ( config.wallops ? 4 : 0 ) + ( config.invisible ? 8 : 0 )
			irc.user(config.username, config.realname ? config.realname : config.username, mode);
		}
	});
	
	dispatcher.on("close", function(error) {
		if (config.log)
			console.log(Date.now() + " CLOSED" + (error ? " WITH ERROR" : ""));
	});
	
	dispatcher.on("dispatchError", function(event, error) {
		console.log("ERROR dispatching " + event + "\n" + error.stack);
		if (irc.lastChannel)
			irc.privMsg(irc.lastChannel, "ERROR dispatching " + event + ", " + error.stack.split("\n")[0]);
	});
	
	dispatcher.on("respondError", function(event, error) {
		console.log("ERROR responding to " + event + "\n" + error.stack);
		if (irc.lastChannel)
			irc.privMsg(irc.lastChannel, "ERROR responding to " + event + ", " + error.stack.split("\n")[0]);
	});
	
	irc.sendRaw = function(msg, nolog) {
		if (!nolog && config.log)
			console.log(Date.now() + " SEND " + msg);
		
		dispatcher.emit("irc/send", msg);
		bot.write(msg + "\r\n");
	};
	
	irc.command = function(source, command) {
		var args = "";
		for (var i = 2; i < arguments.length - 1; i ++)
			args += " " + arguments[i];
		
		var hasLongArg = arguments.length > 2 && arguments[arguments.length - 1] != null;
		
		irc.sendRaw((source ? ":" + source.toString() + " " : "") + command + args +
			(hasLongArg ? " :" + arguments[arguments.length - 1] : ""));
	};
		
	irc.pass = function(pass, callback) {
		irc.command(null, "PASS", pass, null);
	};
	
	irc.nick = function(nick, callback) {
		irc.currentNick = nick;
		irc.command(null, "NICK", nick, null);
	};
	
	irc.user = function(username, realname, mode, callback) {
		irc.command(null, "USER", username, mode, "*", realname);
	};
	
	irc.join = function() {
		irc.command(null, "JOIN", Array.prototype.join.call(arguments, ","), null);
	};
	
	irc.part = function() {
		irc.command(null, "PART", Array.prototype.join.call(arguments, ","), null);
	};
	
	irc.names = function() {
		irc.command(null, "NAMES", Array.prototype.join.call(arguments, ","), null);
	};

	irc.quit = function() {
		var msg = Array.prototype.join.call(arguments, " ") || config.quitMessage || "ponies!";
		irc.command(null, "QUIT", msg, null);
		bot.end();
	};
	
	var lastPrivMsg = "";
	irc.privMsg = function(nick, message) {
		irc.lastChannel = nick;
		
		if (message != lastPrivMsg)
			irc.command(null, "PRIVMSG", nick, message);
		
		lastPrivMsg = message;
	};
	
	irc.notice = function(nick, message) {
		irc.lastChannel = nick;
		irc.command(null, "NOTICE", nick, message);
	};
	
	dispatcher.emit("addResponses", irc.responses = [
		{ action: "quit", group: ["owner"], func: function(source, argv) {
			source.respond("ok, " + source.nick + "! goodbye everypony!");
			if (argv[1]){
				argv.shift();
				irc.quit.apply(irc, argv);
			}
			else
				irc.quit();
		} },	
		{ action: "join", group: ["owner", "authed"], func: function(source, argv) {
			if (argv[1])
			{
				source.respond("ok, " + source.nick + "!");
				argv.shift();
				irc.join.apply(irc, argv);
			}
			else
				source.mention("please specify a channel.");
		} },
		{ action: "part", group: ["owner", "authed"], func: function(source, argv) {
			if (argv[1])
			{
				source.respond("ok, " + source.nick + "!");
				argv.shift();
				irc.part.apply(irc, argv);
			}
			else if (source.from.match(/^#/))
			{
				source.respond("ok, " + source.nick + "!");
				irc.part(source.from);
			}
			else
				source.mention("please specify a channel.");
		} },
	]);
};
