"use strict";

exports.init = function(bot, dispatcher, responses) {
	dispatcher.emit("addResponses", responses.responses = [
		{ action: /\?\s*$/, func: function(source) {
			source.respond("As if I know!");
		} },
		{ action: /[\s,\.]bot[\s!,\.$]/, func: function(source) {
			source.respond("The Great and Powerful Trixie is not some lowly bot!");
		} },
		{ action: /fuck/, func: function(source) {
			source.respond("Hey! Being rude is The Great and Powerful Trixie's job!");
		} },
		{ action: /^(hi|hello|g'day|how's it going|(good )?(morning|afternoon|evening|day))/, func: function(source) {
			source.respond("The Great and Powerful Trixie says hello to " + source.nick);
		} },
	]);
	
	bot.on("respond/unauthed", function(source) {
		source.mention("As if The Great and Powerful Trixie would obey!");
	});
}
