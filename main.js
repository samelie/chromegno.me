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

function start() {
	//console.log(Organizer);
	Organizer.start(_onOrganizationComplete);
}

function _onOrganizationComplete() {
	FFMPEG.start(_onFFMPEGComplete);
}

function _onFFMPEGComplete(clips) {
	process.chdir(path.join(process.cwd(), '../../../../'));
	//we dont need SIDX
	clips = _formatWithoutSidx(clips);
	_saveVideos(clips);

	/*IT FAILED ON SIDX PARSE! :(*/
	//MP4BOX.start(clips, _onMP4BOXComplete);
}

function _onMP4BOXComplete(clips) {
	SIDX.start(clips, _onSIDXComplete);
}

function _onSIDXComplete(clips) {
	//process.chdir(path.join(process.cwd(), '../../../../'));
	var outputFilename = './videos_manifest.json';
	var p = path.join(process.cwd(), 'client/assets/json/' + outputFilename);
	console.log(p);
	if (fs.existsSync(p)) {
		fs.unlinkSync(p);
	}
	fs.writeFile(p, JSON.stringify(_format(clips), null, 4), function(err) {
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
}

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
		var chapter = clip.chapter-1;
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
		ch['videos'] = [];
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