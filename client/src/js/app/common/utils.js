var AP = 0.5625;
var W = 1280;
var H = 720;
'use strict';

var UTILS = (function() {
	var obj = Object.create(null);

	function onAspectResize(w, h, callback) {
		return _doOp(w, h);
	}

	function _doOp(w, h) {
		w = w || window.innerWidth;
		h = h || window.innerHeight;
		var containerRatio = w / h;
		var elRatio = 1280 / 720;
		var scale = 1,
			x, y;

		// define scale
		if (containerRatio > elRatio) {
			if (w > W) {
				scale = w / W;
			} else {
				scale = W / w;
			}
			scale = w / W;
		} else {
			if (h > H) {
				scale = h / H;
			} else {
				scale = H / h;
			}
			scale = h / H;
		}
		// define position
		if (containerRatio === elRatio) {
			x = y = 0;
		} else {
			x = (w - 1280 * scale) * 0.5 / scale;
			y = (h - 720 * scale) * 0.5 / scale;
		}

		// fixed
		//x = Number(x.toFixed(1));
		//y = Number(y.toFixed(1));
		obj['w'] = 1280 * scale;
		obj['h'] = 720 * scale;
		obj['scale'] = scale;
		obj['x'] = x;
		obj['y'] = y;

		return obj;
	}

	return {
		onAspectResize: onAspectResize
	}
})();

module.exports = UTILS;