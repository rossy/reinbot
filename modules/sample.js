"use strict";

exports.init = function(bot, dispatcher, loadavg, responses) {
    dispatcher.emit("addResponses", loadavg.responses = [
		{ command: "t_args", func: function (source, args) {
            source.message("I see: ", args.join(" "));
        } },
        
        { command: "t_reply", func: function (source) {
            source.respond("Hello");
        } },
        
        { command: "t_mention", func: function (source) {
            source.mention("You asked?");
        } }, 
    ]);
}
