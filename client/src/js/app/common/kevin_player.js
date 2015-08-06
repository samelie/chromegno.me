function Kevin() {

	var _cb, _el;

	function onVideoComplete(e) {
		_el.src = "";
		_el.classList.remove('show');
		_cb();
	}

	function init(el, completeCallback) {
		_el = el;
		_el.volume = .18;
		_cb = completeCallback;
		el.addEventListener('ended', onVideoComplete, false);
	}

	function start() {
		_el.classList.add('show');
		_el.src = 'assets/videos/kevin.mp4';
	}

	return {
		init: init,
		start: start
	}
}

module.exports = Kevin;