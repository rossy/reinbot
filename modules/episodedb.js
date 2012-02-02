"use strict";

function Episode(season, episode, data)
{
	this.season = season;
	this.episode = episode;
	for (var i in data)
		this[i] = data[i];
}

exports.init = function (bot, dispatcher, episodedb, config) {
	
};
