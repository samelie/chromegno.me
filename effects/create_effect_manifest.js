var fs = require('fs');
var path = require('path');
var NOISE = require('./noise');

var CHAPTER_DURATION = 45; //mins
var MAX_EFFECT_DURATION = 14 //seconds;
var MIN_EFFECT_DURATION = 10 //seconds;
var MAX_SIMULTANEOUS_EFFECTS = 4;
var CHAPTER_SPEED_RANGES = [
	[0.01, 0.1],
	[0.4, 0.8],
	[0.8, 1.0],
	[0.07, 0.5]
];


var choices = [];
var SCREENS = 2;
var CHAPTERS = 4;

var manifest = [];

'use strict';


for (var i = MIN_EFFECT_DURATION; i < MAX_EFFECT_DURATION; i++) {
	choices.push(i);
}

function _map(v, a, b, x, y) {
	return (v === a) ? x : (v - a) * (y - x) / (b - a) + x;
}

function _clamp(number, min, max) {
	return Math.max(min, Math.min(number, max));
}

function _buildRoutes(routes, chapterIndex) {
	var totalDuration = 0;
	var maxEffects = CHAPTER_DURATION * 60 / MIN_EFFECT_DURATION;

	function __createRoute() {
		if (totalDuration > (CHAPTER_DURATION * 60)) {
			return;
		}
		var route = [];
		var seed = Math.floor(Math.random() * MAX_EFFECT_DURATION);
		for (var i = 1; i < maxEffects; i++) {
			var total = MAX_EFFECT_DURATION;
			var factor = NOISE.getVal(i + Math.floor(Math.random() * 1000));
			var v = Math.floor(_map(factor, 0, 1, MIN_EFFECT_DURATION, MAX_EFFECT_DURATION));
			var numEffects;
			var speedRange = CHAPTER_SPEED_RANGES[chapterIndex];
			var speed = Math.random();
			speed = _map(speed, 0,1, speedRange[0], speedRange[1]);
			speed = parseFloat(speed.toFixed(15));
			switch (chapterIndex) {
				case 0:
				case 3:
					numEffects = Math.ceil(Math.random() * Math.round(MAX_SIMULTANEOUS_EFFECTS * .5));
					break;
				case 1:
				case 2:
					numEffects = Math.ceil(Math.random() * MAX_SIMULTANEOUS_EFFECTS);
					break;
			}
			route.push([v, numEffects, speed]);
			totalDuration += v;
		}
		manifest.push(route);
	}
	__createRoute();
}

for (var i = 0; i < SCREENS; i++) {
	for (var y = 0; y < CHAPTERS; y++) {
		_buildRoutes([], i)
	}
}

var outputFilename2 = 'effect_durations.json'
var p2 = path.join(process.cwd(), '../client/assets/json/' + outputFilename2);
if (fs.existsSync(p2)) {
	fs.unlinkSync(p2);
}
fs.writeFile(p2, JSON.stringify(manifest, null, 4), function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("JSON saved to " + p2);
	}
});