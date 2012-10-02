"use strict";

global.reinbot_path = __dirname;

function Module(name, bot, dispatchBase)
{
	var events = [];
	var dispatcher = {
		on: function(event, listener) {
			events.push({event: event, listener: listener});
			dispatchBase.on(event, listener);
		},
		once: function(event, listener) {
			events.push({event: event, listener: listener});
			dispatchBase.once(event, listener);
		},
		addListener: function(event, listener) {
			events.push({event: event, listener: listener});
			dispatchBase.addListener(event, listener);
		},
		removeListener: function(event, listener) {
			events.some(function(obj, i) {
				if (obj.event == event && obj.listener == listener)
				{
					events.splice(i, 1);
					return true;
				}
				return false;
			});
			dispatchBase.removeListener(event, listener);
		},
		emit: function(event) {
			try {
				dispatchBase.emit.apply(dispatchBase, arguments);
			}
			catch (e) {
				dispatchBase.emit.call(dispatchBase, "dispatchError", event, e);
			}
		},
	};
	
	this.name = name;
	this.fileName = reinbot_path + "/modules/" + name + ".js";
	this.fullPath = require.resolve(this.fileName);
	
	if (!bot[name])
		bot[name] = {};
	if (!bot.config[name])
		bot.config[name] = {};
	
	this.obj = bot[name];
	this.config = bot.config[name];
	
	this.dispose = function() {
		delete require.cache[this.fullPath];
		
		events.forEach(function(event) {
			dispatchBase.removeListener(event.event, event.listener);
		});
	};
	
	require(this.fileName).init(bot, dispatcher, this.obj, this.config);
}

exports.connect = function(port, host, ssl, connectListener) {
	return new (function Bot() {
		var dispatcher = new (require("events").EventEmitter)();
		var self = this;
		var socket = (ssl ? require("tls") : require("net")).connect(port, host, function() {
			if (connectListener)
				connectListener();
			dispatcher.emit("connect");
			
			socket.setEncoding('utf8');
			socket.on("data", dispatcher.emit.bind(dispatcher, "data"));
			socket.on("data", dispatcher.emit.bind(dispatcher, "close"));
		});
		
		dispatcher.setMaxListeners(0);
		dispatcher.on("newListener", function(event, listener) {
			var i, name;
			
			if (((i = event.indexOf("/")) + 1) && (name = event.substr(0, i)))
				self.require(name);
		});
		
		this.config = {};
		
		var modules = [];
		this.require = function(name) {
			if (modules.every(function(module) { return module.name != name; }))
				modules.push(new Module(name, this, dispatcher));
		};
		
		this.modules = modules;
		
		this.reload = function(name) {
			modules.some(function(module, i) {
				if (module.name == name)
				{
					module.dispose();
					modules.splice(i, 1);
					return true;
				}
				return false;
			});
			
			modules.push(new Module(name, this, dispatcher));
		};
		
		this.on = this.addListener = dispatcher.on.bind(dispatcher);
		this.off = this.removeListener = dispatcher.removeListener.bind(dispatcher);
		this.once = dispatcher.once.bind(dispatcher);
		this.emit = dispatcher.emit.bind(dispatcher);
		this.write = socket.write.bind(socket);
		this.end = socket.end.bind(socket);
	})();
};
