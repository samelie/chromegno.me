'use strict';
require('dotenv').config({
	path: './envvars'
});
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
	///console.log(Organizer);
	Organizer.start(_onOrganizationComplete);
}

function _onOrganizationComplete() {
	setTimeout(function(){
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
	console.log(n);
	process.chdir(path.join(process.cwd(), '../../../../'));
	var outputFilename = './videos_manifest.json';
	var p = path.join(process.cwd(), 'client/assets/json/' + outputFilename);
	console.log(p);
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

	/*var outputFilename2 = 'blank_tags.json'
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
	});*/
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
			_.each(vid['dashed'],function(clip, i){
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
				var relPath =  p[p.length - 3] + '/' +  p[p.length - 2] + '/' + p[p.length - 1];
				clip['relPath'] = relPath;
			});
		});
	});
	return newManifest;
}



//NO LONGER
function _saveVideos(clips) {
	var outputFilename = './videos_manifest.json';
	var p = path.join(process.cwd(), 'client/assets/json/' + outputFilename);
	console.log(p);
	if (fs.existsSync(p)) {
		fs.unlinkSync(p);
	}
	fs.writeFile(p, JSON.stringify(clips), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + p);
		}
	});
}

function _formatWithoutSidx(rawClips) {
	var manifest = [];
	_.each(rawClips, function(clip) {
		var chapter = clip.chapter - 1;
		if (!manifest[chapter]) {
			manifest[chapter] = Object.create(null);
			manifest[chapter]['videos'] = [];
		}
		manifest[chapter]['videos'].push(clip);
	});
	return manifest;
}

function _format(clips) {
	var manifest = [];
	_.each(clips, function(chapter) {
		var ch = Object.create(null);
		ch['videos'] = [];
		if (chapter['dashed']) {
			_.each(chapter['dashed'], function(clip) {
				var c = Object.create(null);
				c['path'] = clip['video']
				c['sidx'] = clip['sidx']
				ch['videos'].push(c)
			});
		} else {

		}
		manifest.push(ch);
	});
	return manifest;
}


function _createBlankTagManifest(clips) {
	var manifest = [];
	_.each(clips, function(chapter, cI) {
		var ch = Object.create(null);
		ch['youtube'] = [];
		_.each(chapter['dashed'], function(clip, kI) {
			var c = Object.create(null);
			c['chapter'] = cI;
			c['index'] = kI;
			ch['videos'].push(c)
		});
		manifest.push(ch);
	});
	return manifest;
}

start();

///Volumes/Fat boy/Work/gallery-viz/data/pics/2