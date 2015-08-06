/*var PlayerController = Object.create(require('./player_manager'));
PlayerController.init = function(){

};
*/
var PlayerController = function(chapterCompleteCallback) {
	'use strict';
	if (!MediaSource) {
		throw new Error('NO MEDIASOURCE!');
	}

	var requestId;

	//booleans
	var updatedStarted, locked, starting = true;

	//playback info
	var segDuration = 0,
		playOffset = 0,
		enterFrameCounter = 0,
		previousCurrentTime = 0,
		segmentIndex = 0,
		totalSegments = 0,
		skipCount = 0,

		chapterIndex = 0,
		currentChapter = 0;

	//callback
	var onNewVo, needMoreSegments;
	////-----------------
	//SETUP
	////-----------------

	var videoElement;
	var youtubeVideoElement;
	var mediaSource;
	var sourceBuffer;

	//ref to proto
	var _manifest;
	var youtubeManifest;
	var playlist;
	var boundUpdate;

	function init(vEl) {

		videoElement = vEl;

		mediaSource = new MediaSource();
		var url = URL.createObjectURL(mediaSource);
		videoElement.src = url;

		mediaSource.addEventListener('sourceopen', _onSourceOpen, false);
		boundUpdate = onUpdate.bind(this);
		requestId = window.requestAnimationFrame(boundUpdate);
	}

	function _onSourceOpen(e) {
		_newSourceBuffer();
		starting = false;
		console.log("source open");
	}

	function _newSourceBuffer() {
		mediaSource.removeEventListener('sourceopen', _onSourceOpen);
		sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42c01e"');
		sourceBuffer.addEventListener('updatestart', onBufferUpdateStart);
		sourceBuffer.addEventListener('updateend', onBufferUpdateEnd);
	}

	////-----------------
	//BUFFER HANDLERS
	////-----------------


	function onBufferUpdateStart() {
		updatedStarted = true;
	}

	function onBufferUpdateEnd() {
		/*sourceBuffer.removeEventListener('updateend', onBufferUpdateEnd);
		var currentVo = playlist[segmentIndex - 1];
		if (currentVo) {
			segDuration = currentVo['durationSec'];
			var dur = playOffset;
			if (dur === 0) {
				dur = currentVo['durationSec'];
			}
			mediaSource.duration = dur;
		}
		sourceBuffer.addEventListener('updateend', onBufferUpdateEnd);*/
		updatedStarted = false;
		locked = false;
	}

	////-----------------
	//UPDATE
	////-----------------

	function onUpdate() {
		if (totalSegments > 0) {
			if (segmentIndex < totalSegments) {
				if (!updatedStarted || !locked) {
					//console.log(videoElement.currentTime ,(playOffset - segDuration * .8), segDuration);
					if (videoElement.currentTime >= (playOffset - segDuration * .8)) {
						locked = true;
						var data = currentChapter[segmentIndex];
						if (data) {
							var clip = data['clip'];
							playOffset += clip['duration'];
							segDuration = clip['duration'];
							playSegment(clip);
							_setYoutubeVideo();
						} else {
							console.log('No more at', segmentIndex);
						}
					}
				}
			} else {
				console.error("No More videos");
				_onChapterComplete();
			}
		}

		previousCurrentTime = videoElement.currentTime;
		requestId = window.requestAnimationFrame(boundUpdate);
	}

	//----------
	//PLAY A VO
	//----------

	function playSegment(data) {
		var self = this;
		var url = 'assets/videos/' + data['relPath'];
		var xhr = new XMLHttpRequest();
		console.log(url);
		xhr.open('GET', url);
		xhr.setRequestHeader("Range", "bytes=" + data['mediaRange']);
		xhr.send();
		xhr.responseType = 'arraybuffer';
		xhr.addEventListener("readystatechange", function() {
			if (xhr.readyState == xhr.DONE) { //wait for video to load
				if (!sourceBuffer || !mediaSource || starting) {
					return;
				}
				var segResp = new Uint8Array(xhr.response);
				var off;
				if (sourceBuffer.buffered.length > 0) {
					off = sourceBuffer.buffered.end(sourceBuffer.buffered.length - 1);
				}

				function _trySettingOffset() {
					try {
						sourceBuffer.timestampOffset = off || 0;
						initialRequest(data, __addInit);
					} catch (e) {
						resetMediasource();
					}
				}

				function __addInit(initRes) {
					sourceBuffer.removeEventListener('updateend', onBufferUpdateEnd);
					sourceBuffer.addEventListener('updateend', __onInitAdded);
					sourceBuffer.appendBuffer(initRes);
				}

				function __onInitAdded() {
					if (mediaSource.readyState === 'open') {
						sourceBuffer.removeEventListener('updateend', __onInitAdded);
						sourceBuffer.addEventListener('updateend', onBufferUpdateEnd);
						//var ts = sourceBuffer.timestampOffset - data['startTimeSec'];
						//sourceBuffer.timestampOffset = ts;
						console.log(segmentIndex, '/', totalSegments);
						sourceBuffer.appendBuffer(segResp);
						segmentIndex++;

						/*if (onNewVo) {
							onNewVo(data);
						}*/
					}
				}
				_trySettingOffset();
			}
		}, false);
	}


	function initialRequest(data, callback) {
		var url = 'assets/videos/' + data['relPath'];
		var xhr = new XMLHttpRequest();
		var range = "bytes=0-" + (data['firstOffset'] - 1);
		xhr.open('GET', url);
		xhr.setRequestHeader("Range", range);
		xhr.send();
		xhr.responseType = 'arraybuffer';
		try {
			xhr.addEventListener("readystatechange", function() {
				if (xhr.readyState == xhr.DONE) { // wait for video to load
					callback(new Uint8Array(xhr.response));
				}
			}, false);
		} catch (e) {
			log(e);
		}
	}

	//crash
	function resetMediasource() {
		console.error("RESETING");
		sourceBuffer.removeEventListener('updateend', onBufferUpdateEnd);
		sourceBuffer.removeEventListener('updatestart', onBufferUpdateStart);
		mediaSource.removeSourceBuffer(sourceBuffer);
		sourceBuffer = null;
		mediaSource.duration = 0;
		enterFrameCounter = 0;
		mediaSource = null;
		locked = updatedStarted = false;
		videoElement.play();
		videoElement.currentTime = 0;
		segDuration = playOffset = 0;
		init(videoElement);
	}

	function _onChapterComplete() {
		chapterIndex++;
		chapterCompleteCallback(chapterIndex);
		if (chapterIndex > _manifest.length - 1) {
			chapterIndex = 0;
		}
		segmentIndex = 0;
		currentChapter = _manifest[chapterIndex];
		totalSegments = currentChapter.length;
	}

	function _setYoutubeVideo(){
		if(!youtubeManifest){
			return;
		}
		var chapter = youtubeManifest[chapterIndex];
		if(chapter){
			var i = segmentIndex % chapter.length-1;
			var clips = chapter[i];
			if(clips){
				var ran = Math.floor(Math.random()*clips.length-1);
				youtubeVideoElement.src = clips[ran];
				console.log(youtubeVideoElement.src);
			}
		}
	}
	///---------------
	//API
	///---------------

	function setYoutubeManifest(videoEl, manifest) {
		youtubeVideoElement = videoEl;
		youtubeManifest = manifest;
	}

	function setOnNewVo(callback) {
		onNewVo = callback;
	}

	function setEntireManifest(manifest) {
		_manifest = manifest;
		currentChapter = _manifest[chapterIndex];
		totalSegments = currentChapter.length;
	}

	function getChapterIndex(){
		return chapterIndex;
	}

	function pause(){
		window.cancelAnimationFrame(requestId);
	}

	function resume(){
		requestId = window.requestAnimationFrame(boundUpdate);
	}

	return {
		init: init,
		pause: pause,
		resume: resume,
		getChapterIndex: getChapterIndex,
		setOnNewVo: setOnNewVo,
		setEntireManifest: setEntireManifest,
		setYoutubeManifest: setYoutubeManifest
	}
};

module.exports = PlayerController;