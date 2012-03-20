"use strict";
var http = require("http");
var xml2js = require("xml2js");

exports.init = function(bot, dispatcher, weather, config) {
	dispatcher.emit("addResponses", weather.responses = [
		{ command: "we", func: function(source, argv) {
			var data = "";
			if (!argv[1])
				source.mention("please give a location.");
			
			if (argv[1].toLowerCase() == "equestria")
			{
				source.respond("Equestria, 25\u00b0C, sunny, humidity: 30%");
				return;
			}
			
			argv.shift();
			
			http.get({
				host: "www.google.com",
				path: "/ig/api?weather=" + argv.join("+"),
			}, function(res) {
				res.on("data", function(chunk) {
					data += chunk;
				});
				res.on("end", function() {
					(new xml2js.Parser()).parseString(data, function (err, result) {
						if (err)
							source.respond("error parsing xml, " + err);
						else
						{
							try {
								if (result.weather.problem_cause)
									source.respond("i don't know where that is, " + source.nick);
								else
								{
									var loc = result.weather.forecast_information;
									var cur = result.weather.current_conditions;
									source.respond(loc.city["@"].data + ", " +
										cur.temp_c["@"].data + "\u00b0C, " +
										cur.condition["@"].data.toLowerCase() + ", " +
										cur.humidity["@"].data.toLowerCase());
								}
							}
							catch (e) {
								source.respond("error parsing xml, " + e.stack.split("\n")[0]);
							}
						}
					});
				});
			});
		} },
	]);
}
