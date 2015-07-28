'use strict';
require('dotenv').config({
	path: './envvars'
});
var program = require('commander');
program
	.option('-n, --noupload', 'noupload')
	.option('-s, --skip', 'Skip')
	.parse(process.argv);

process.customArgs = program;
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');
var shell = require('shelljs');
var Organizer = require('./app/organizer');
var FFMPEG = require('./app/ffmpeg');
var MP4BOX = require('./app/mp4box');
var SIDX = require('./app/sidx');

var NUM_CHAPTERS = 4;

function start() {
	if (!process.customArgs.skip) {
		Organizer.start(_onOrganizationComplete);
	} else {
		_readAndCopy();
	}
}

function _onOrganizationComplete() {
	setTimeout(function() {
		FFMPEG.start(_onFFMPEGComplete);
	}, 2000);
}

function _onFFMPEGComplete(clips) {
	process.chdir(path.join(process.cwd(), '../../../../'));
	//we dont need SIDX
	//clips = _formatWithoutSidx(clips);
	//_saveVideos(clips);

	/*IT FAILED ON SIDX PARSE! :(*/
	MP4BOX.start(clips, _onMP4BOXComplete);
}

function _onMP4BOXComplete(clips) {
	SIDX.start(clips, _onSIDXComplete);
}

function _onSIDXComplete(clips) {
	var n = _restructure(clips);
	process.chdir(path.join(process.cwd(), '../../../../'));
	var outputFilename = './videos_manifest.json';
	var p = path.join(process.cwd(), 'client/assets/json/' + outputFilename);
	if (fs.existsSync(p)) {
		fs.unlinkSync(p);
	}
	fs.writeFile(p, JSON.stringify(n, null, 4), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + p);
		}
	});

	var outputFilename2 = 'blank_tags.json'
	var p2 = path.join(process.cwd(), 'tagging/' + outputFilename2);
	if (fs.existsSync(p2)) {
		fs.unlinkSync(p2);
	}
	fs.writeFile(p2, JSON.stringify(_createBlankTagManifest(clips), null, 4), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + p2);
		}
	});

	_copyDashedVideo(n);
}


function _restructure(clips) {
	if (clips.length < 10) {
		return _prepVideosManifest(clips);
	}

	var newManifest = [];
	for (var i = 0; i < NUM_CHAPTERS; i++) {
		newManifest[i] = [];
	}
	_.each(clips, function(clip) {
		delete clip['defer'];
		var split = clip['dir'].split('/');
		var chapter = clip['chapter'];
		var index = clip['index'];
		newManifest[chapter][index] = clip;
	});
	var n = _prepVideosManifest(newManifest);
	return n;
}

function _prepVideosManifest(newManifest) {
	_.each(newManifest, function(chapter, chIndex) {
		_.each(chapter, function(vid) {
			_.each(vid['dashed'], function(clip, i) {
				var references = clip['sidx']['references'];
				var totalDuration = 0;
				_.each(references, function(ref, iRef) {
					totalDuration += ref['durationSec'];
					if (iRef === references.length - 1) {
						clip['mediaRange'] = clip['sidx']['firstOffset'] + '-' + ref['endRange'];
					}
				});
				clip['codec'] = clip['parsedMpd']['codecs'];
				clip['firstOffset'] = clip['sidx']['firstOffset'];
				clip['duration'] = totalDuration;
				clip['chapter'] = chIndex;
				clip['index'] = i;
				var p = clip['video'].split('/');
				var relPath = p[p.length - 3] + '/' + p[p.length - 2] + '/' + p[p.length - 1];
				clip['relPath'] = relPath;
			});
		});
	});
	return newManifest;
}

function _copyDashedVideo(clips) {

	function __doCopy(from, to) {
		var p = path.join(process.cwd(), 'client/assets/videos/', to);
		fs.copy(from, p, {
			replace: true
		}, function(err) {
			if (err) {
				// i.e. file already exists or can't write to directory 
				throw err;
			}
		});
	}

	_.each(clips, function(chapter, chIndex) {
		_.each(chapter, function(vid) {
			_.each(vid['dashed'], function(clip, i) {
				__doCopy(clip['video'], clip['relPath']);
			});
		});
	});
}


function _createBlankTagManifest(clips) {
	if (clips.length < 10) {
		return _prepVideosManifest(clips);
	}

	var newManifest = [];
	for (var i = 0; i < NUM_CHAPTERS; i++) {
		newManifest[i] = [];
	}
	_.each(clips, function(clip) {
		delete clip['defer'];
		var split = clip['dir'].split('/');
		var chapter = clip['chapter'];
		var index = clip['index'];
		newManifest[chapter][index] = {
			tags: ""
		};
	});
	return newManifest;
}

function _readAndCopy() {
	var outputFilename = './videos_manifest.json';
	var p = path.join(process.cwd(), 'client/assets/json/' + outputFilename);
	fs.readFile(p, function(err, data) {
		if (err) {
			console.log(err);
		}
		_copyDashedVideo(JSON.parse(data));
	});
}

start();

///Volumes/Fat boy/Work/gallery-viz/data/pics/2