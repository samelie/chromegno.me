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
		skipCount = 0;

	//callback
	var onNewVo, needMoreSegments;
	////-----------------
	//SETUP
	////-----------------

	var videoElement;
	var mediaSource;
	var sourceBuffer;

	//ref to proto
	var playlist;
	var boundUpdate;

	function init(vEl) {

		playlist = this.prototype.playlist;

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
		sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42c01f,mp4a.40.2"');
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
		totalSegments = playlist.length;
		if (totalSegments > 0) {
			if (segmentIndex < totalSegments) {
				if (!updatedStarted || !locked) {
					if (videoElement.currentTime >= (playOffset - segDuration * .8)) {
						locked = true;
						enterFrameCounter = 0;
						var data = playlist[segmentIndex];
						if (data) {
							console.log(data['durationSec']);
							playOffset += data['durationSec'];
							segDuration = data['durationSec'];
							playSegment(data);
						} else {
							console.log('No more at', segmentIndex);
						}
					}
				}
				if (enterFrameCounter > (segDuration * 60 + 1000)) {
					if (previousCurrentTime === videoElement.currentTime) {
						//console.log("Skipping!", updatedStarted, locked, videoElement.currentTime > (playOffset - segDuration * .7));
						console.log("Reseting!");
						//resetMediasource();
						/*skipCount++;
	                        if (skipCount === 2) {
	                            skipCount = 0;
	                        } else {
	                            videoElement.currentTime += 0.2;
	                        }*/
					}
					enterFrameCounter = 0;
				}
			} else {
				this.prototype.addRandomRange();
				console.error("No More videos");
			}
		}
		if (segmentIndex > totalSegments - 3) {
			this.prototype.addRandomRange();
		}

		previousCurrentTime = videoElement.currentTime;
		enterFrameCounter++;
		requestId = window.requestAnimationFrame(boundUpdate);
	}

	//----------
	//PLAY A VO
	//----------

	function playSegment(data) {
		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', data['url']);
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
						var ts = sourceBuffer.timestampOffset - data['startTimeSec'];
						//sourceBuffer.timestampOffset = ts;
						sourceBuffer.appendBuffer(segResp);
						segmentIndex++;

						if (onNewVo) {
							onNewVo(data);
						}
					}
				}
				initialRequest(data, __addInit);
			}
		}, false);
	}


	function initialRequest(data, callback) {
		var xhr = new XMLHttpRequest();
		var range = "bytes=0-" + (data['firstOffset'] - 1);
		xhr.open('GET', data['url']);
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

	///---------------
	//API
	///---------------

	function setOnNewVo(callback) {
		onNewVo = callback;
	}

	return {
		init: init,
		addRoute: addRoute
	}
};
var playerController = new PlayerController();
playerController.prototype = require('./player_manager');

module.exports = playerController;