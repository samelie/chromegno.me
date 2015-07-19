'use strict';

var path = require('path');
var shell = require('shelljs');
var Organizer = require('./app/organizer');
var FFMPEG = require('./app/ffmpeg');
var MP4BOX = require('./app/mp4box');

function start() {
	//console.log(Organizer);
	Organizer.start(_onOrganizationComplete);
}

function _onOrganizationComplete() {
	FFMPEG.start(_onFFMPEGComplete);
}

function _onFFMPEGComplete(clips) {
	process.chdir(path.join(process.cwd(), '../../../../'));
	console.log(process.cwd());
	MP4BOX.start(clips, _onMP4BOXComplete);
}

function _onMP4BOXComplete(clips) {
	console.log(clips);
}

start();

///Volumes/Fat boy/Work/gallery-viz/data/pics/2