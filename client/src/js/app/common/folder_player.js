function FolderPlayer(videoEl, manifest) {
	var _el = videoEl;
	var _manifest = manifest;

	function onVideoComplete(e) {
		_playOne();
	}

	_el.addEventListener('ended', onVideoComplete, false);

	function _playOne() {
		var ran = Math.floor(Math.random() * _manifest.length - 1);
		_el.src = _manifest[ran];
		_el.play();
	}

	function start() {
		_playOne();
	}

	return {
		start: start,
		stop: stop
	}
}

module.exports = FolderPlayer;