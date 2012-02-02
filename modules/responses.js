"use strict";

exports.init = function(bot, dispatcher, responses) {
	dispatcher.emit("addResponses", responses.responses = [
		{ action: /\?\s*$/, func: function(source) {
			source.respond("don't ask me, i'm just a bot");
		} },
		{ action: /[\s,\.]bot[\s!,\.$]/, func: function(source) {
			source.respond("i'm not a bot, i'm a real pony");
		} },
		{ action: /fuck/, func: function(source) {
			source.respond("that's not very nice");
		} },
		{ action: /^(hi|hello|g'day|how's it going|(good )?(morning|afternoon|evening|day))/, func: function(source) {
			source.respond("hi " + source.nick);
		} },
	]);
	
	bot.on("respond/unauthed", function(source) {
		source.mention("you can't tell me what to do!");
	});
}
