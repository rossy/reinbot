"use strict";
var http = require("http");

var numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

function makeNumber(num) {
    return numbers[num] || num;
}

exports.init = function(bot, dispatcher, countdown, config) {
    var ponytime = 1325948400;
    var lastcheck = 0;

    function cdfunc(source, channel) {
        function cdstring(now, ponytime) {
            var ttnextep = ponytime - now;
            var auto = false;
            while (ttnextep < 0) {
                auto = true;
                ttnextep += 604800;
            }

            if (auto && ttnextep > 603300) return "it's airing right now you silly filly!";

            var days = Math.floor(ttnextep / 86400);
            var hours = Math.floor(ttnextep / 3600 - days * 24);
            var minutes = Math.floor(ttnextep / 60 - days * 1440 - hours * 60);
            var seconds = ttnextep - days * 86400 - hours * 3600 - minutes * 60;
            var retstr = "";

            if (days) retstr = "it's still " + makeNumber(days) + " day" + (days == 1 ? "" : "s") + (hours ? " and " + makeNumber(hours) + " hour" + (hours == 1 ? "" : "s") : "");
            else if (hours) retstr = "only " + makeNumber(hours) + " hour" + (hours == 1 ? "" : "s") + (minutes ? " and " + makeNumber(minutes) + " minute" + (minutes == 1 ? "" : "s") : "");
            else if (minutes) retstr = "only " + makeNumber(minutes) + " minute" + (minutes == 1 ? "" : "s") + (seconds ? " and " + makeNumber(seconds) + " second" + (seconds == 1 ? "" : "s") : "");
            else if (seconds) retstr = "only " + makeNumber(seconds) + " second" + (seconds == 1 ? "" : "s");
            else retstr = "less than a second";

            return retstr + " until the next episode!";
        }

        var now = new Date().getTime();
        var said = false;

        if (now - lastcheck > 3600000) {
            http.get({
                host: "ponycountdown.com",
                path: "/api.js"
            }, function(res) {
                var data = "";
                res.setEncoding("utf8");
                res.on("data", function(chunk) {
                    if (chunk) {
                        data += chunk;
                    }
                }).on("end", function() {
                    var dnow = new Date().getTime();
                    var ponycountdowndates = data.match(new RegExp('([A-Za-z]+)([ \n\r\t]+)([0-9]+)([,]+)([ \n\r\t]+)([0-9]+)([ \n\r\t]+)([0-9]+)([:]+)([0-9]+)([:]+)([0-9]+)', 'g'));
                    if (ponycountdowndates === null) {
                        return;
                    }
                    var pt = NaN;
                    for (var i = 0; i < ponycountdowndates.length; i++) {
                        pt = new Date(ponycountdowndates[i]).getTime();
                        if (pt > dnow) {
                            break;
                        }
                    }

                    if (isNaN(pt) & !said) {
                        said = true;
                        bot.irc.privMsg(channel, source.nick + ", " + cdstring(Math.round(dnow / 1000), ponytime));
                    }
                    else if (!said) {
                        said = true;
                        lastcheck = dnow;
                        ponytime = Math.round(pt / 1000);
                        bot.irc.privMsg(channel, source.nick + ", " + cdstring(Math.round(dnow / 1000), ponytime));
                    }
                });
            }).on("error", function(e) {
                if (!said) {
                    said = true;
                    bot.irc.privMsg(channel, source.nick + ", " + cdstring(Math.round(new Date().getTime() / 1000), ponytime));
                }
            });
        }
        else if (!said) {
            said = true;
            bot.irc.privMsg(channel, source.nick + ", " + cdstring(Math.round(now / 1000), ponytime));
        }
    }

    dispatcher.emit("addResponses", countdown.responses = [{
        command: "cd",
        func: function(source, argv) {
            cdfunc(source, source.from);
        }
    }]);
};