'use strict';

var ffmpeg = require('fluent-ffmpeg');
var _ = require('lodash');
var path = require('path');
var dir = require('node-dir');
var fs = require('fs-extra');
var exec = require('child_process').exec;

//var FRAME_RATES = ['3','2','1', (1 / 2).toFixed(3).toString(), (1 / 3).toFixed(3).toString(), (1 / 4).toFixed(3).toString()];
var FRAME_RATES = ['3', '2', '1'];
var IMGS_PER_CLIP = 12;
var EXT = '.png';

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
			//console.log('\t', clipInfo['dir']);

			function __encodeComplete() {
				clipInfo['videos'].push(output);
				frIndex++;
				var fr = FRAME_RATES[frIndex];
				console.log("NEW FR:", fr);
				if (fr) {
					__generateCrossfade(fr);
					//__encodeMp4(fr);
				} else {
					index++;
					__ripClip();
				}
			}

			function __generateCrossfade(framerate) {
				var command = "ffmpeg ";
				var indexs = [];
				var count = 0;
				var br = '2500k';
				var scale = 720;
				output = {
					path: clipInfo['index'] + "_" + frIndex + ".mp4",
					duration: framerate * IMGS_PER_CLIP
				};
				if (fs.existsSync(output['path'])) {
					__encodeComplete();
					return;
				}
				dir.files(process.cwd(), function(err, files) {
					_.each(files, function(file, i) {
						if (file.indexOf('.DS_') === -1 && file.indexOf('.mp4') === -1) {
							command += '-loop 1 -t ' + framerate + ' -i ' + file + " ";
							if (i < files.length - 1) {
								indexs.push(count);
							}
							count++;
						}
					});
					command += '-filter_complex \"';
					_.each(indexs, function(i) {
						command += "[" + (i + 1) + ":v][" + i + ":v]blend=all_expr='A*(if(gte(T,0.5),1,T/0.5))+B*(1-(if(gte(T,0.5),1,T/0.5)))'[b" + (i + 1) + "v];"
					});
					_.each(indexs, function(i, y) {
						command += "[" + i + ":v][b" + (i + 1) + "v]";
					});

					command += "[" + indexs.length + ":v]concat=n=" + (count * 2 - 1) + ":v=1:a=0,scale=-1:" + scale + "[v]\"";
					command += " -map \"[v]\" -codec:v libx264 -b:v " + br + " -maxrate " + br + " -bufsize " + br + " -threads 4 -r 24 -g 12 -codec:a libfdk_aac -b:a 128k -preset fast -profile:v baseline -pix_fmt yuv420p -y " + output['path'];
					console.log(command);
					var ff = exec(command, function(error, stdout, stderr) {
						if (error) {}
					});
					ff.on('exit', function(code) {
						setTimeout(function() {
							console.log(framerate, "COMPLETE");
							__encodeComplete();
						}, 1000);
					});
				});
			}
			/*
			"[1:v][0:v]blend=all_expr='A*(if(gte(T,0.5),1,T/0.5))+B*(1-(if(gte(T,0.5),1,T/0.5)))'[b1v]; \
 [2:v][1:v]blend=all_expr='A*(if(gte(T,0.5),1,T/0.5))+B*(1-(if(gte(T,0.5),1,T/0.5)))'[b2v]; \
 [3:v][2:v]blend=all_expr='A*(if(gte(T,0.5),1,T/0.5))+B*(1-(if(gte(T,0.5),1,T/0.5)))'[b3v]; \
 [4:v][3:v]blend=all_expr='A*(if(gte(T,0.5),1,T/0.5))+B*(1-(if(gte(T,0.5),1,T/0.5)))'[b4v]; \
 [0:v][b1v][1:v][b2v][2:v][b3v][3:v][b4v][4:v]concat=n=9:v=1:a=0[v]" - map "[v]" - y out.mp4*/

			/*			"[1:v][0:v]blend=all_expr='A*(if(gte(T,0.5),1,T/0.5))+B*(1-(if(gte(T,0.5),1,T/0.5)))'[b0v];\
			[2:v][1:v]blend=all_expr='A*(if(gte(T,0.5),1,T/0.5))+B*(1-(if(gte(T,0.5),1,T/0.5)))'[b1v];\
			[3:v][2:v]blend=all_expr='A*(if(gte(T,0.5),1,T/0.5))+B*(1-(if(gte(T,0.5),1,T/0.5)))'[b2v];\
			[0:v][b0v][1:v][b1v][2:v][b2v][3:v]concat=n=9:v=1:a=0[v]" - map "[v]" -y 0_0.mp4*/

			function __encodeMp4(framerate) {
				output = {
					path: clipInfo['index'] + "_" + frIndex + ".mp4",
					duration: framerate * IMGS_PER_CLIP
				};
				if (fs.existsSync(output['path'])) {
					__encodeComplete();
					return;
				}
				var br = '2000k';
				var scale = 720;
				var command = "ffmpeg -framerate " + framerate + " -pattern_type glob -i \'*" + EXT + "\' -codec:v libx264 -b:v " + br + " -maxrate " + br + " -bufsize " + br + " -vf scale=-1:" + scale + " -threads 4 -r 24 -g 12 -codec:a libfdk_aac -b:a 128k -preset fast -profile:v baseline -pix_fmt yuv420p -y " + output['path'];
				console.log(command);
				var ff = exec(command, function(error, stdout, stderr) {
					if (error) {}
				});
				ff.on('exit', function(code) {
					console.log("DONE");
					setTimeout(function() {
						__encodeComplete();
					}, 1000);
				});
			}
			//__encodeMp4(FRAME_RATES[frIndex])
			__generateCrossfade(FRAME_RATES[frIndex]);
		}

		__ripClip();
	}
	return {
		start: start
	}
})();

module.exports = FFMPEG;