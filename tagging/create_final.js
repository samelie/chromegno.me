var dir = require('node-dir');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var DIR_PATH = path.join(process.cwd(), 'assets/youtube');
var SAVE_PATH = path.join(process.cwd(), '../client/assets/json/', 'youtube_manifest.json');
var CHAPTERS = 4;

var manifest = [];

function start() {
	dir.files(DIR_PATH, function(err, files) {
		if (err) throw err;
		for (var i = 0; i < CHAPTERS; i++) {
			manifest[i] = [];
		}
		_.each(files, function(d) {
			var split = d.split('/');
			var chapter = parseInt(split[split.length - 3], 10);
			var index = parseInt(split[split.length - 2], 10);
			if (!manifest[chapter][index]) {
				manifest[chapter][index] = [];
			}
			var p = 'assets/youtube/' + chapter + '/' + index + '/' + split[split.length - 1];
			manifest[chapter][index].push(p);
		});
		fs.writeFile(SAVE_PATH, JSON.stringify(manifest, null, 4), function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log("JSON saved to " + SAVE_PATH);
			}
		});
	});
}

start();