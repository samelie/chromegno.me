var _ = require('lodash');
var Perlin = require('./noise');

var Proto = Object.create(null);
Proto.playlist = [];
Proto.currentClipManifest = undefined;
Proto.currentSidxManifest = undefined;

Proto.getRandomClip = function() {

};

Proto.getNextClip = function() {

};

Proto.setSidxManifest = function() {

};

Proto.setClipManifest = function() {

};

Proto.setRawSidxManifest = function(sidxManifest) {
	_.each(sidxManifest, function(sidx) {
		sidx['sidx'] = JSON.parse(sidx['sidx']);
	});

	this.currentSidxManifest = sidxManifest;
};

Proto.parseClipsManifest = function(clipsManifest) {
	_.each(clipsManifest, function(clip) {
		if (clip['youtube_captions']) {
			clip['youtube_captions'] = JSON.parse(clip['youtube_captions']);
		}
		if (clip['clip_keywords_youtube']) {
			clip['clip_keywords_youtube'] = JSON.parse(clip['clip_keywords_youtube']);
		}
	});
	this.currentClipManifest = clipsManifest;
};


Proto.addRandomRange = function() {
	//random
	if (!this.currentSidxManifest) {
		return;
	}
	var ran = Math.floor(Math.random() * this.currentSidxManifest.length);
	var VO = this.currentSidxManifest.splice(ran, 1)[0];
	var sidx = VO['sidx'];
	var referencesNum = sidx['references'].length - 1;
	var factor = Perlin.getVal(ran);
	var howManyToUse = Math.min(Math.round(referencesNum * factor), Math.floor(referencesNum * .3));
	//console.log("Using ", howManyToUse, "for ", VO['url']);
	var totalDuration = 0;
	var vo = Object.create(null);
	vo = _.assign(vo, sidx['references'][howManyToUse]);
	vo['clip_id'] = VO['clip_id'];
	vo['durationSec'] = vo['durationSec'] + vo['startTimeSec'];
	vo['firstOffset'] = sidx['firstOffset'];
	vo['mediaRange'] = vo['firstOffset'] + '-' + vo['mediaRange'].split('-')[1];
	//console.log(vo);
	//console.log(vo['mediaRange']);
	vo['url'] = VO['url'];
	this.playlist.push(vo);
	//console.log(this.playlist.length);
};


module.exports = Proto;