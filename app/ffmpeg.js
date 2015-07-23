'use strict';

var ffmpeg = require('fluent-ffmpeg');
var _ = require('lodash');
var path = require('path');
var dir = require('node-dir');
var fs = require('fs-extra');
var exec = require('child_process').exec;

//var FRAME_RATES = ['3','2','1', (1 / 2).toFixed(3).toString(), (1 / 3).toFixed(3).toString(), (1 / 4).toFixed(3).toString()];
var FRAME_RATES = ['3', '2', '1', (1 / 2).toFixed(3).toString(), (1 / 3).toFixed(3).toString(), (1 / 4).toFixed(3).toString()];
var IMGS_PER_CLIP = 12;
var EXT = '.JPG';

var FFMPEG = (function() {
	var picsDir = path.join(process.cwd(), 'data/pics');

	function start(callback) {
		var clips = [];
		dir.subdirs(picsDir, function(err, dirs) {
			_.each(dirs, function(path) {
				var info = _getClipInfo(path);
				if (info) {
					clips.push(info);
				}
			});
			_createClips(clips, callback);
		});
	}

	function _getClipInfo(clipFolder) {
		var data = Object.create(null);
		var split = clipFolder.split('/');
		var chapter = clipFolder.split('/')[split.length - 2];
		if (chapter.indexOf('pics') !== -1) {
			return undefined;
		}
		var index = clipFolder.split('/')[split.length - 1];
		data['dir'] = clipFolder;
		data['chapter'] = chapter;
		data['index'] = index;
		return data;
	}

	function _createClips(clips, callback) {
		var index = 0;

		function __ripClip() {
			var clipInfo = clips[index];
			if (!clipInfo) {
				callback(clips);
				return;
			}
			clipInfo['videos'] = [];
			var frIndex = 0;
			var output;
			process.chdir(clipInfo['dir']);

			function __encodeComplete() {
				clipInfo['videos'].push(output);
				frIndex++;
				var fr = FRAME_RATES[frIndex];
				if (fr) {
					__encodeMp4(fr);
				} else {
					index++;
					__ripClip();
				}
			}

			function __encodeMp4(framerate) {
				output = {
					path:clipInfo['index'] + "_" + frIndex + ".mp4",
					duration:framerate*IMGS_PER_CLIP
				};
				if (fs.existsSync(output['path'])) {
					__encodeComplete();
					return;
				}
				var br = '100k';
				var scale = 480;
				var command = "ffmpeg -framerate " + framerate + " -pattern_type glob -i \'*" + EXT + "\' -codec:v libx264 -b:v "+br+" -maxrate "+br+" -bufsize "+br+" -vf scale=-1:"+scale+" -threads 4 -r 24 -g 12 -codec:a libfdk_aac -b:a 128k -preset fast -profile:v baseline -pix_fmt yuv420p -y " + output['path'];
				console.log(command);
				var ff = exec(command, function(error, stdout, stderr) {
					if (error) {}
				});
				ff.on('exit', function(code) {
					console.log("DONE");
					__encodeComplete();
				});
			}
			__encodeMp4(FRAME_RATES[frIndex])
		}

		__ripClip();
	}
	return {
		start: start
	}
})();

module.exports = FFMPEG;