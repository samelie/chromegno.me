/*var PlayerController = Object.create(require('./player_manager'));
PlayerController.init = function(){

};
*/
var PlayerController = function() {
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
	var mediaSource;
	var sourceBuffer;

	//ref to proto
	var _manifest;
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
		mediaSource.removeEventListener('sourceopen', _onSourceOpen);
		sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42c01e"');
		sourceBuffer.addEventListener('updatestart', onBufferUpdateStart);
		sourceBuffer.addEventListener('updateend', onBufferUpdateEnd);
		starting = false;
		console.log("source open");
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
							console.warn(segDuration)
							playSegment(clip);
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
		var url = 'assets/videos/'+data['relPath'];
		var xhr = new XMLHttpRequest();
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
				console.log(mediaSource.readyState);
				sourceBuffer.timestampOffset = off || 0;

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
						console.log(mediaSource.readyState);
						sourceBuffer.appendBuffer(segResp);
						segmentIndex++;

						/*if (onNewVo) {
							onNewVo(data);
						}*/
					}
				}
				initialRequest(data, __addInit);
			}
		}, false);
	}


	function initialRequest(data, callback) {
		var url = 'assets/videos/'+data['relPath'];
		var xhr = new XMLHttpRequest();
		var range = "bytes=0-" + (data['firstOffset'] - 1);
		xhr.open('GET', url);
		xhr.setRequestHeader("Range", range);
		xhr.send();
		xhr.responseType = 'arraybuffer';
		try {
			xhr.addEventListener("readystatechange", function() {
				if (xhr.readyState == xhr.DONE) { // wait for video to load
					while(updatedStarted){}
					callback(new Uint8Array(xhr.response));
				}
			}, false);
		} catch (e) {
			log(e);
		}
	}

	//crash
	function resetMediasource() {
		window.cancelAnimationFrame(requestId);
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
		//init();
		/*sourceBuffer.addEventListener('updateend', __onDurationSet);
        var duration = mediaSource.duration;

        function __onDurationSet(e) {
            sourceBuffer.removeEventListener('updateend', __onDurationSet);
            sourceBuffer.addEventListener('updateend', onBufferUpdateEnd);
            sourceBuffer.timestampOffset = 0;
            sourceBuffer.remove(0, duration);
            videoElement.currentTime = 0;
            segDuration = playOffset = 0;
            console.log("ZEROED");
        }*/

	}

	function _onChapterComplete(){
		chapterIndex++;
		if(chapterIndex > _manifest.length -1){
			chapterIndex = 0;
		}
		segmentIndex = 0;
		currentChapter = _manifest[chapterIndex];
		totalSegments = currentChapter.length;
	}
	///---------------
	//API
	///---------------

	function setOnNewVo(callback) {
		onNewVo = callback;
	}

	function setEntireManifest(manifest){
		_manifest = manifest;
		currentChapter = _manifest[chapterIndex];
		totalSegments = currentChapter.length;
	}

	return {
		init: init,
		setOnNewVo: setOnNewVo,
		setEntireManifest: setEntireManifest
	}
};

module.exports = PlayerController;