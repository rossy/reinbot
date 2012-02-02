var wolframalpha = require("wolframalpha")

exports.init = function(bot, dispatcher, loadavg) {
	dispatcher.emit("addResponses", loadavg.responses = [
		{ command: "calc", func: function(source, argv) {
			if (!argv[1])
				source.mention("please tell me what to calculate. beep boop.");
			
			argv.shift();
			(new wolframalpha()).search(argv.join(" "), function(result) {
				source.mention(result.data ? result.data.replace(/\\'/g, "'") : "i don't know the answer :(");
			});
		} },
	]);
}
