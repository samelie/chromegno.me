'use strict';

function Webcam(videoEl) {
	var _mediaStream;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

	function handleVideo(stream) {
		_mediaStream = stream
		// if found attach feed to video element
		videoEl.src = window.URL.createObjectURL(_mediaStream);
	}

	function videoError(e) {
		// no webcam found - do something
	}

	function start() {
		if (navigator.getUserMedia) {
			navigator.getUserMedia({
				video: true
			}, handleVideo, videoError);
		}
	}

	function stop() {
		if(_mediaStream){
			_mediaStream.stop();
		}
	}

	return {
		start: start,
		stop: stop
	}
}

module.exports = Webcam;