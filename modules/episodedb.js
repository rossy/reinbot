"use strict";

var fs = require("fs");
var jsdom = require("jsdom");

var formats = {"hdtv1080p": "hdtv1080p", "hd": "hdtv1080p", "itunes720p": "itunes720p", "itunes": "itunes720p", "raw": "itunes720p", "cc720p": "cc720p", "cc": "cc720p", "sd": "sd"};

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
	scanPage("http://sd-23144.dedibox.fr/ddl1.php", 1, function() {
		scanPage("http://sd-23144.dedibox.fr/ddl2.php", 2, function() {
			scanPage("http://sd-23144.dedibox.fr/torrents1.php", 1, function() {
				scanPage("http://sd-23144.dedibox.fr/torrents2.php", 2, function() {
					if (m) m.mention("done!");
				});
			});
		});
	});
}

function identToArr(arg) {
    var temp = arg.split("x");
    
    temp[0] = temp[0] - 1;
    
    return temp;
}

function magnet(source, argv) {
    return null;
}

function findEpisode(ident) {
    for (var v in episodes.seasons) {
    console.log(JSON.stringify(v));
        for (var n in v) {
            console.log(JSON.stringify(n));
            if (n.episode == ident[1]) {
                return n;
            }
        }
    }
    
    return null;
}

/*
function o_btih(m)
{
	var episode;
	var format = formats[m.match_data[3]] || "itunes720p";
	
	if ((episode = episodes.seasons[parseInt(m.match_data[1]) - 1]) && (episode = episode[parseInt(m.match_data[2]) - 1]) && episode[format] && episode[format].btih)
		m.mention(episode[format].btih);
	else
		m.mention("i can't find an info hash for that episode");
}

function o_magnet(m, argv)
{
	var episode;
	var format = "itunes720p";
	
	if ((episode = episodes.seasons[parseInt(argv[1]) - 1]) && (episode = episode[parseInt(argv[3]) - 1]) && episode[format] && episode[format].btih)
		m.mention("magnet:?xt=urn:btih:" + episode[format].btih);
	else
		m.mention("i can't find a magnet link for that episode, " + m.user);
}

function o_torrent(m)
{
	var episode;
	var format = formats[m.match_data[3]] || "itunes720p";
	
	if ((episode = episodes.seasons[parseInt(m.match_data[1]) - 1]) && (episode = episode[parseInt(m.match_data[2]) - 1]) && episode[format] && episode[format].btih)
		m.mention(" http://torrage.ws/torrent/" + episode[format].btih + ".torrent");
	else
		m.mention("i can't find a torrent for that episode, " + m.user);
}

function o_mu(m)
{
	var episode;
	var format = formats[m.match_data[3]] || "itunes720p";
	
	if ((episode = episodes.seasons[parseInt(m.match_data[1]) - 1]) && (episode = episode[parseInt(m.match_data[2]) - 1]) && episode[format] && episode[format].mu)
		m.mention(m.user + ", http://www.multiupload.com/" + episode[format].mu);
	else
		m.mention("i can't find a MultiUpload link for that episode, " + m.user);
}
*/

function Episode(season, episode, data)
{
	this.season = season;
	this.episode = episode;
	for (var i in data)
		this[i] = data[i];
}

exports.init = function(bot, dispatcher, loadavg) {
	
	dispatcher.emit("addResponses", loadavg.responses = [
		{ command: "lsep", func: function(source, argv) {
		      source.mention("See PM for details");
              var episode = identToArr(argv[1]);
              var res = findEpisode(episode);
              //console.log(JSON.stringify(findEpisode(episode)));
		      source.message(findEpisode(episode));
		} },
		
		{ command: "magnet", func: function(source, argv) {
		      source.mention(magnet(source, argv));
		} },
		
		{ command: "reload", func: function(source, argv) {
		      source.mention("Loading episodes, please wait.");
		      console.log("Loading episodes");
		      refreshEps(source);
		      console.log("Loaded episodes");
		} },
	]);
}
