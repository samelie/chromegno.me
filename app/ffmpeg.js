'use strict';

var ffmpeg = require('fluent-ffmpeg');
var _ = require('lodash');
var path = require('path');
var dir = require('node-dir');
var fs = require('fs-extra');
var exec = require('child_process').exec;

var FRAME_RATES = ['3', '1', (1 / 3).toFixed(3).toString()];
var IMGS_PER_CLIP = 12;
var EXT = '.JPG';

var Organizer = (function() {
	var picsDir = path.join(process.cwd(), 'data/pics');

	function start() {
		var clips = [];
		dir.subdirs(picsDir, function(err, dirs) {
			_.each(dirs, function(path) {
				var info = _getClipInfo(path);
				if (info) {
					clips.push(info);
				}
			});
			_createClips(clips);
		});
	}

	function _getClipInfo(clipFolder) {
		var split = clipFolder.split('/');
		var chapter = clipFolder.split('/')[split.length - 2];
		if (chapter.indexOf('pics') !== -1) {
			return undefined;
		}
		var index = clipFolder.split('/')[split.length - 1];
		return [clipFolder, chapter, index];

		/*function __encode(frameRate) {
			var cmd = 'prince -v builds/pdf/book.html -o builds/pdf/book.pdf';
			exec(cmd, function(error, stdout, stderr) {
				// command output is in stdout
			});
		}*/
	}

	function _createClips(clips) {
		var index = 0;

		function __ripClip() {
			var clipInfo = clips[index];
			process.chdir(clipInfo[0]);
			console.log(process.cwd());
			var frIndex = 0;

			function __encodeMov(framerate) {
				var output = clipInfo[2] + ".mov";
				var ff = exec("ffmpeg -framerate " + framerate + " -pattern_type glob -i \'*.JPG\' -y -vcodec prores " + output, function(error, stdout, stderr) {
					if (error) {}
				});
				ff.on('exit', function(code) {
					console.log('Child process exited with exit code ' + code);
					___encodeMp4(clipInfo[2]);
				});
				/*console.log(output);
				ffmpeg("\'*" + EXT + "\'")
					.inputOptions("-framerate " + framerate)
					.inputOptions('-pattern_type glob')
					.videoCodec('prores')
					.output(output)
					.on('start', function(cmd) {
						console.log(cmd);
					})
					.on('error', function(err) {
						console.log('An error occurred: ' + err.message);
					})
					.on('end', function() {
						___encodeMp4(clipInfo[2]);
					})
					.run();*/
			}

			function ___encodeMp4(p) {
				console.log(p);
				ffmpeg(p + '.mov')
					.inputOptions('-threads 8')
					.outputOptions('-map 0')
					.outputOptions('-profile:v Baseline')
					.outputOptions('-g 12')
					.outputOptions('-strict -2')
					.format('mp4')
					.output(p + '.mp4')
					.on('start', function(commandLine) {
						console.log(commandLine);
					})
					.on('error', function(err) {
						console.log(err);
					})
					.on('end', function() {
						frIndex++;
						var fr = FRAME_RATES[frIndex];
						if (fr) {
							__encodeMov(fr);
						} else {
							index++;
							__ripClip();
						}
					})
					.run();
			}
			/*	var ff = exec("ffmpeg -framerate 3 -pattern_type glob -i \'*.JPG\' -y -vcodec prores 0.mov", function(error, stdout, stderr) {
				if (error) {}
			});
			ff.on('exit', function(code) {
				console.log('Child process exited with exit code ' + code);
			});*/
			__encodeMov(FRAME_RATES[frIndex])
		}
		__ripClip();
	}

	start();

})();

//ffmpeg -framerate 1 -pattern_type glob -i '*.png' -c:v libx264 -pix_fmt yuv420p out.mp4