var jerk = require("jerk");
var jsdom = require("jsdom");
var fs = require("fs");
var https = require("https");
var util = require("util");

var authed = ["rossy", "FLYingG0D", "desumoyo", "desumoyo_osx", "desumoyo_laptop", "shadowh511"];
var name = "reinbot";
var ponytime = 1325948400;
var lastcheck = 0;
var numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
var formats = {"hdtv1080p": "hdtv1080p", "hd": "hdtv1080p", "itunes720p": "itunes720p", "itunes": "itunes720p", "raw": "itunes720p", "cc720p": "cc720p", "cc": "cc720p", "sd": "sd"};

var config = JSON.parse(fs.readFileSync("config.json", "utf-8")); 
var episodes = JSON.parse(fs.readFileSync("episodes.json", "utf-8")); 

function scanPage(page, season, callback)
{
	season -= 1;
	episodes.seasons[season] || (episodes.seasons[season] = []);
	jsdom.env(page, [], function(errors, window) {
		var document = window.document;
		var rows = document.getElementById("container").getElementsByTagName("table")[0].getElementsByTagName("tr");
		
		for (var i = 0; i < rows.length; i ++)
		{
			var cols = rows[i].getElementsByTagName("td");
			var episode = 99;
			
			for (var j = 0; j < cols.length; j ++)
			{
				var cell = cols[j].childNodes;
				
				for (var k = 0; k < cell.length; k ++)
				{
					var text;
					var match;
					
					if (text = cell[k].textContent)
					{
						var type;
						
						if (match = text.match(/Episode (\d+)/i))
						{
							episode = parseInt(match[1]) - 1;
							break;
						}
						else if (text.match(/720p.*Raw/i) || text.match(/720p.*TEMP/)) type = "itunes720p";
						else if (text.match(/720p.*CC/i)) type = "cc720p";
						else if (text.match(/1080p/i)) type = "hdtv1080p";
						else if (text.match(/SD/i)) type = "sd";
						
						if (type && episode != 99)
							for (; k < cell.length && cell[k].tagName != "P" && cell[k].tagName != "BR"; k ++)
								if (cell[k].tagName == "A")
									if (match = cell[k].getAttribute("href").match(/^http:\/\/www.multiupload.com\/(.*)$/))
									{
										episodes.seasons[season][episode] || (episodes.seasons[season][episode] = {episode: episode + 1});
										episodes.seasons[season][episode][type] || (episodes.seasons[season][episode][type] = {});
										episodes.seasons[season][episode][type].mu = match[1];
									}
									else if (match = cell[k].getAttribute("href").match(/magnet:\?xt=urn:btih:(.*)/))
									{
										episodes.seasons[season][episode] || (episodes.seasons[season][episode] = {episode: episode + 1});
										episodes.seasons[season][episode][type] || (episodes.seasons[season][episode][type] = {});
										episodes.seasons[season][episode][type].btih = match[1];
									}
					}
				}
			}
		}
		callback();
	});
}

function refreshEps(m)
{
	scanPage("http://web.yayponies.eu/ddl1.php", 1, function() {
		scanPage("http://web.yayponies.eu/ddl2.php", 2, function() {
			scanPage("http://web.yayponies.eu/torrents1.php", 1, function() {
				scanPage("http://web.yayponies.eu/torrents2.php", 2, function() {
					if (m) m.say("done!");
				});
			});
		});
	});
}

function makeNumber(num)
{
	return numbers[num] || num;
}

function btih(m)
{
	var episode;
	var format = formats[m.match_data[3]] || "itunes720p";
	
	if ((episode = episodes.seasons[parseInt(m.match_data[1]) - 1]) && (episode = episode[parseInt(m.match_data[2]) - 1]) && episode[format] && episode[format].btih)
		m.say(m.user + ", " + episode[format].btih);
	else
		m.say("i can't find an info hash for that episode, " + m.user);
}

function magnet(m)
{
	var episode;
	var format = formats[m.match_data[3]] || "itunes720p";
	
	if ((episode = episodes.seasons[parseInt(m.match_data[1]) - 1]) && (episode = episode[parseInt(m.match_data[2]) - 1]) && episode[format] && episode[format].btih)
		m.say(m.user + ", magnet:?xt=urn:btih:" + episode[format].btih);
	else
		m.say("i can't find a magnet link for that episode, " + m.user);
}

function torrent(m)
{
	var episode;
	var format = formats[m.match_data[3]] || "itunes720p";
	
	if ((episode = episodes.seasons[parseInt(m.match_data[1]) - 1]) && (episode = episode[parseInt(m.match_data[2]) - 1]) && episode[format] && episode[format].btih)
		m.say(m.user + ", http://torrage.ws/torrent/" + episode[format].btih + ".torrent");
	else
		m.say("i can't find a torrent for that episode, " + m.user);
}

function mu(m)
{
	var episode;
	var format = formats[m.match_data[3]] || "itunes720p";
	
	if ((episode = episodes.seasons[parseInt(m.match_data[1]) - 1]) && (episode = episode[parseInt(m.match_data[2]) - 1]) && episode[format] && episode[format].mu)
		m.say(m.user + ", http://www.multiupload.com/" + episode[format].mu);
	else
		m.say("i can't find a MultiUpload link for that episode, " + m.user);
}

function countdown(m)
{
	function cdstring(now, ponytime)
	{
		var ttnextep = ponytime - now;
		var auto = false;
		while (ttnextep < 0)
		{
			auto = true;
			ttnextep += 604800;
		}
		
		if (auto && ttnextep > 603300)
			return "it's airing right now you silly filly!";
		
		var days = Math.floor(ttnextep / 86400);
		var hours = Math.floor(ttnextep / 3600 - days * 24);
		var minutes = Math.floor(ttnextep / 60 - days * 1440 - hours * 60);
		var seconds = ttnextep - days * 86400 - hours * 3600 - minutes * 60;
		var retstr = "";
		
		if (days)
			retstr = "it's still " + makeNumber(days) + " day" + (days == 1 ? "" : "s") + (hours ? " and " + makeNumber(hours) + " hour" + (hours == 1 ? "" : "s") : "");
		else if (hours)
			retstr = "only " + makeNumber(hours) + " hour" + (hours == 1 ? "" : "s") + (minutes ? " and " + makeNumber(minutes) + " minute" + (minutes == 1 ? "" : "s") : "");
		else if (minutes)
			retstr = "only " + makeNumber(minutes) + " minute" + (minutes == 1 ? "" : "s") + (seconds ? " and " + makeNumber(seconds) + " second" + (seconds == 1 ? "" : "s") : "");
		else if (seconds)
			retstr = "only " + makeNumber(seconds) + " second" + (seconds == 1 ? "" : "s");
		else
			retstr = "less than a second";
		
		return retstr + " until the next episode!";
	}
	
	var now = new Date().getTime();
	
	if (now - lastcheck > 3600000)
	{
		https.get({
			host: "raw.github.com",
			path: "/gist/7c951c79891ae9ecde73",
		}, function(res) {
			res.setEncoding("utf8");
			res.on("data", function(chunk) {
				var dnow = new Date().getTime();
				var pt = parseInt(chunk);
				
				if (isNaN(pt))
					m.say(m.user + ", " + cdstring(Math.round(dnow / 1000), ponytime));
				else
				{
					lastcheck = dnow;
					m.say(m.user + ", " + cdstring(Math.round(dnow / 1000), pt));
				}
			});
		}).on("error", function(e) {
			m.say(m.user + ", " + cdstring(Math.round(new Date().getTime() / 1000), ponytime));
			reinbot.say("rossy", "my countdown function is broken :(");
		});
	}
	else
		m.say(m.user + ", " + cdstring(Math.round(now / 1000), ponytime));
}

function respond(m)
{
	var hasAuth = authed.indexOf(m.user) + 1;
	var command = m.match_data[1];
	var mdata;
	
	function noAuth()
	{
		m.say("you can't tell me what to do.");
	}
	
	if (mdata = command.match(/^join (#\S+)/))
	{
		if (!hasAuth) { noAuth(); return; }
		reinbot.join(mdata[1]);
		m.say("ok, " + m.user + "!");
	}
	else if (command.match(/^part/))
	{
		if (!hasAuth) { noAuth(); return; }
		reinbot.part(m.source);
		m.say("ok, " + m.user + "!");
	}
	else if (command.match(/^quit/))
	{
		if (!hasAuth) { noAuth(); return; }
		m.say("ok, " + m.user + ". goodbye everypony!");
		reinbot.quit();
	}
	else if (command.match(/^(refresh|reload)/))
	{
		if (!hasAuth) { noAuth(); return; }
		m.say("ok, " + m.user + ", reloading episodes.");
		episodes = JSON.parse(fs.readFileSync("episodes.json", "utf-8"));
		refreshEps(m);
	}
	else if (command.match(/\?\s*$/))
		m.say("don't ask me, i'm just a bot.");
	else if (command.indexOf("bot") + 1)
		m.say("i'm not a bot, i'm a real pony.");
	else if (command.indexOf("fuck") + 1)
		m.say("that's not very nice :<");
	else
		m.say("i don't know how to " + command.replace(/your/g, "my"));
}

refreshEps();

var reinbot = jerk(function(j) {
	j.watch_for(/(hi( there)?|hello( there)?|sup|g'day|how's it going|(good )?(morning|afternoon|evening|day)),?\s*reinbot\s*/, function(m) {
		m.say("hi " + m.user);
	});
	
	j.watch_for(/((good|nighty|night) night|nn),?\s*reinbot/, function(m) {
		m.say("nighty night " + m.user);
	});
	
	j.watch_for(/(bye( bye)?|see (ya|you)( later)?|adios|sayonara),?\s*reinbot/, function(m) {
		m.say("bye bye " + m.user);
	});
	
	j.watch_for(/^reinbot[,:]\s*$/, function(m) {
		m.say("that's me");
	});
	
	j.watch_for(/^reinbot,\s*(.*)$/, respond);
	j.watch_for(/^reinbot:\s*(.*)$/, respond);
	j.watch_for(/(.*)/, function(m) {
		if (m.user == m.source)
			respond(m);
	});
	
	j.watch_for(/fuck(.*)reinbot/, function(m) {
		m.say("that's mean :(");
	});
	
	j.watch_for(/reinbot\s*is(.*)bot/, function(m) {
		m.say("no i'm not, i'm a real pony");
	});
	
	j.watch_for(/^\.cd/, countdown);
	j.watch_for(/^\.btih s?(\d+)[xe]?(\d+)\s*(\S+)?/, btih);
	j.watch_for(/^\.magnet s?(\d+)[xe]?(\d+)\s*(\S+)?/, magnet);
	j.watch_for(/^\.torrent s?(\d+)[xe]?(\d+)\s*(\S+)?/, torrent);
	j.watch_for(/^\.mu s?(\d+)[xe]?(\d+)\s*(\S+)?/, mu);
}).connect({
	server:   "irc.us.ponychat.net",
	port:     6668,
	encoding: "utf-8",
	nick:     name,
	die:      false,
	user: {
		username: name,
		realname: "Rainbow Dash",
	},
	onConnect: function() {
		if (config.nspass)
			reinbot.say("NickServ", "identify " + config.nspass);
		reinbot.join("#ponyarchive");
		reinbot.join("#YayPonies");
	},
});
