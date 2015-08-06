function FolderPlayer(videoEl, manifest, options) {
	var _el = videoEl;
	var _manifest = manifest;
	var _webcam;
	var WEBCAM_PROB = 0.2;
	var WEBCAM_DURATION_MIN = 30000;
	var WEBCAM_DURATION_MAX = 180000;

	var preferedFiles = options['files'];

	function onVideoComplete(e) {
		var roll = Math.random();
		if (!_webcam) {
			_playOne();
			return;
		}
		if (roll < WEBCAM_PROB) {
			stop();
			_startWebcam();
		} else {
			_playOne();
		}
	}

	function _playOne() {
		var ran = Math.floor(Math.random() * _manifest.length - 1);
		if (ran > _manifest.length * options['probability']) {
			var p = Math.floor(Math.random() * preferedFiles.length);
			_.each(_manifest, function(file, i) {
				var n = file.indexOf(preferedFiles[p]);
				if (n !== -1) {
					ran = i;
				}
			});
		}
		if (!_manifest[ran]) {
			_playOne();
			return;
		}
		console.log(_manifest[ran]);
		_el.src = _manifest[ran];
		_el.play();
	}

	function _startWebcam() {
		_webcam.start();
		setTimeout(function() {
			_webcam.stop();
			start();
		}, Math.floor(Math.random() * WEBCAM_DURATION_MAX) + WEBCAM_DURATION_MIN);
	}

	function setWebcamSwap(webcam) {
		_webcam = webcam;
	}

	function start() {
		_el.removeEventListener('ended', onVideoComplete);
		_el.addEventListener('ended', onVideoComplete, false);
		_playOne();
	}

	function stop() {
		_el.removeEventListener('ended', onVideoComplete);
	}

	return {
		setWebcamSwap: setWebcamSwap,
		start: start,
		stop: stop
	}
}

module.exports = FolderPlayer;