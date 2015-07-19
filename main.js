'use strict';
require('dotenv').config({
	path: './envvars'
});
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
	MP4BOX.start(clips, _onMP4BOXComplete);
}

function _onMP4BOXComplete(clips) {
	console.log(clips[0]['dashed']);
	SIDX.start(clips);
}

start();

///Volumes/Fat boy/Work/gallery-viz/data/pics/2