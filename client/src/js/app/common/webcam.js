'use strict';

function Webcam(videoEl) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

	if (navigator.getUserMedia) {
		navigator.getUserMedia({
			video: true
		}, handleVideo, videoError);
	}

	function handleVideo(stream) {
		// if found attach feed to video element
		videoEl.src = window.URL.createObjectURL(stream);
	}

	function videoError(e) {
		// no webcam found - do something
	}
}

module.exports = Webcam;