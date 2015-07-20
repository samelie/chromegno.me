var path = require('path');
var fs = require('../tagging/node_modules/fs-extra');

var CHAPTERS = 4;
var CLIPS = 20;
var SEGMENTS = [(1 / 6).toFixed(3), (1 / 4).toFixed(3), (1 / 2).toFixed(3), 1, 2, 3];

var IMAGES_SEGMENT = 12;


var manifest = [];

for (var i = 0; i < CHAPTERS; i++) {
	var ch = [];
	for (var j = 0; j < CLIPS; j++) {
		var clip = Object.create(null);
		clip['videos'] = [];
		for (var k = 0; k < SEGMENTS.length; k++) {
			var seg = Object.create(null);
			seg['path'] = k;
			seg['duration'] = SEGMENTS[k] * 12;
			clip['videos'].push(seg);
		}
		ch.push(clip)
	}
	manifest.push(ch);
}

var outputFilename = 'dummy_manifest.json';
fs.writeFile(outputFilename, JSON.stringify(manifest, null, 4), function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("JSON saved to " + outputFilename);
		var o = path.join(process.cwd(), '../client/assets/json/' + outputFilename)
		fs.copy(outputFilename, o, function(err) {
			if (err) return console.error(err)
			console.log("success!")
		})
	}
});