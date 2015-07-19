'use strict';

var _ = require('lodash');
var path = require('path');
var dir = require('node-dir');
var fs = require('fs-extra');

var IMGS_PER_CLIP = 12;
var EXT = 'JPG';

var Organizer = (function() {
	var picsDir = path.join(process.cwd(), 'data/pics');

	function start(callback) {
		dir.subdirs(picsDir, function(err, dirs) {
			//goes too deep if already organized
			if (dirs.length > 4) {
				console.log("SKIPPED");
				callback();
				return;
			}
			_.each(dirs, function(path) {
				//only choose the folders just at the root level
				if (path.length === 44) {
					_createFolders(path, callback);
				}
			});
		});
	}

	function _createFolders(folderPath, callback) {
		//console.log(folderPath);
		var numImages = 0,
			count = 0,
			index = 0;
		dir.files(folderPath, function(err, files) {
			_.each(files, function(file) {
				if (file.indexOf(EXT) !== -1) {
					numImages++;
				}
			});
			var numVideos = Math.floor(numImages / IMGS_PER_CLIP);
			var i = 0;
			for (i; i < numVideos; i++) {
				var newFolder = path.join(folderPath, i.toString());
				if (fs.existsSync(newFolder)) {
					fs.emptydirSync(newFolder);
				}
			}
			i = 0;
			for (i; i < numVideos; i++) {
				var newFolder = path.join(folderPath, i.toString());
				fs.ensureDir(newFolder, function(err) {});
			}
			i = 0;

			function __next() {
				var p = files[index];
				console.log(p, index);
				if (!p) {
					process.chdir(path.join(process.cwd(), '../../../../'));
					console.log(process.cwd());
					callback();
					return;
				}
				var split = p.split('/');
				var name = split.pop();
				var newPath = split.join('/');
				index++;
				if (name.indexOf(EXT) !== -1) {
					//console.log(newPath);
					//index++;
					fs.move(p, path.join(newPath, count.toString(), name), function(err) {
						if (index % 12 === 0) {
							count++;
						}
						__next();
					});
				} else {
					__next();
				}
			}
			__next();
		});
	}

	return {
		start: start
	}
})();

module.exports = Organizer;