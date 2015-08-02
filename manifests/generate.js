var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var dir = require('node-dir');
var MADE_FOLDER = path.join(process.cwd(), '../client/assets/videos/made');
var MADE_JSON = path.join(process.cwd(), '../client/assets/json/made_manifest.json');
var GNOME_FOLDER = path.join(process.cwd(), '../client/assets/videos/gnome');
var GNOME_JSON = path.join(process.cwd(), '../client/assets/json/gnome_manifest.json');

dir.files(MADE_FOLDER, function(err, files) {
	console.log(files);
	var save = [];
	_.each(files, function(file) {
		if (file.indexOf('.DS') === -1) {
			var s = file.split('/');
			var p = 'assets/videos/made/' + s[s.length - 1];
			save.push(p);
		}
	});

	fs.writeFile(MADE_JSON, JSON.stringify(save, null, 4), function(err, data) {

	});
});

dir.files(GNOME_FOLDER, function(err, files) {
	console.log(files);
	var save = [];
	_.each(files, function(file) {
		if (file.indexOf('.DS') === -1) {
			var s = file.split('/');
			var p = 'assets/videos/gnome/' + s[s.length - 1];
			save.push(p);
		}
	});

	fs.writeFile(GNOME_JSON, JSON.stringify(save, null, 4), function(err, data) {

	});
});