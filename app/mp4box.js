'use strict';

var ffmpeg = require('fluent-ffmpeg');
var _ = require('lodash');
var path = require('path');
var dir = require('node-dir');
var fs = require('fs-extra');
var exec = require('child_process').exec;
var xml2js = require('xml2js');

var MPD = {
	codecs: undefined,
	bandwidth: undefined,
	baseUrl: undefined,
	indexRange: undefined
};

var MP4BOX = (function() {
	'use strict';
	var clipIndex = 0;
	var _callback, _clips, _parser;

	function start(clips, callback) {
		_parser = new xml2js.Parser();
		_clips = clips;
		clipIndex = 0;
		_callback = callback;
		_createMP4(clips[clipIndex]);
	}

	function _createMP4(clip) {
		if (!clip) {
			//_callback(_clips);
			_parseMpd();
			return;
		}
		process.chdir(clip['dir']);
		clip['dashed'] = [];
		var name = clip['index'] + '_';

		function __doRip() {
			var name = clip['videos'][clip['dashed'].length];
			name = name.substring(0, name.length - 4);
			_createClipMPD(clip, name, __doRip);
		}

		__doRip();
	}

	function _createClipMPD(clip, name, callback) {
		//dir = dir.replace('\ ');
		process.chdir(clip['dir']);
		console.log(name);
		//console.log(process.cwd());
		var out = name + '.mp4';
		//output of dashed mp4
		var dashedName = name + '_dashed.mp4';
		if (fs.existsSync(clip['dir'] + '/' + name + "_dashinit.mp4")) {
			clipIndex++;
			_createMP4(_clips[clipIndex]);
			return;
		}
		var dis = 1000;
		var command = 'mp4box -dash ' + dis + ' -frag ' + dis + ' -rap -frag-rap -profile onDemand -mpd-title ' + name + ' ' + out;
		//console.log(command);
		var ls = exec(command);

		ls.on('exit', function(code) {
			//mp4box ads this _dashedinit
			var d = {
				video: clip['dir'] + '/' + name + '_dashinit.mp4',
				mpd: clip['dir'] + '/' + name + '_dash.mpd'
			};
			clip['dashed'].push(d);
			//new name
			//var newPath = dir + '/' + dashedName;
			if (clip['dashed'].length === clip.videos.length) {
				clipIndex++;
				_createMP4(_clips[clipIndex]);
			} else {
				callback();
			}
		});

		ls.on('error', function(stdin, stderr) {
			console.log(stderr);
		});
	}

	function _parseMpd() {
		var count = 0;
		var total = 0;
		_.each(_clips, function(clip) {
			total += clip['dashed'].length;
		});

		function __parse(clip) {
			var dashed = clip['dashed'];
			_.each(dashed, function(obj) {
				console.log(obj['mpd']);
				fs.readFile(obj['mpd'], function(err, data) {
					_parser.parseString(data, function(err, result) {
						if (err || !result) {
							defer.reject(seg);
							return;
						}
						var mpdVo = _.clone(MPD);
						var repesentation = result['MPD']['Period'][0]['AdaptationSet'][0]['Representation'][0];
						mpdVo['codecs'] = repesentation['$']['codecs'];
						mpdVo['bandwidth'] = repesentation['$']['bandwidth'];
						mpdVo['baseUrl'] = dashedName;
						mpdVo['indexRange'] = '0-' + repesentation['SegmentBase'][0]['$']['indexRange'].split('-')[1];
						dashed.push(mpdVo);
						count++;
						if (count === total) {
							console.log("DONE");
						}
					});
				});
			});
		}

		_.each(_clips, function(clip) {
			__parse(clip);
		});

	}

	return {
		start: start
	}
})();

module.exports = MP4BOX;