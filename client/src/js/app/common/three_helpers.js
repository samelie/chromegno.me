var TWEEN = require('tweenjs');
var isFullscreen = false;
var ThreeHelpers = function() {
	'use strict';

	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b) {
		return componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	var _hasWebkitFullScreen = 'webkitCancelFullScreen' in document ? true : false;
	var _hasMozFullScreen = 'mozCancelFullScreen' in document ? true : false;
	///---------------
	//API
	///---------------

	function fullscreen(element) {
		element = element || document.body;

		if (!isFullscreen) {
			if (_hasWebkitFullScreen) {
				element.webkitRequestFullScreen();
			} else if (_hasMozFullScreen) {
				element.mozRequestFullScreen();
			} else {
				console.assert(false);
			}
			isFullscreen = true;
		} else {
			if (_hasWebkitFullScreen) {
				document.webkitCancelFullScreen();
			} else if (_hasMozFullScreen) {
				document.mozCancelFullScreen();
			} else {
				console.assert(false);
			}
			isFullscreen = false;
		}
	}

	function startRandomColorTween(onupdate) {
		var currentColor = getRandomColor();
		var newColor;
		setInterval(function() {
			newColor = getRandomColor();
			new TWEEN.Tween(currentColor)
				.to(newColor, 5000)
				.easing(TWEEN.Easing.Sinusoidal.InOut)
				.onUpdate(function() {
					//var hex = '0x'+rgbToHex(Math.floor(this.r), Math.floor(this.g), Math.floor(this.b));
					//console.log(hex);
					onupdate(this);
				})
				.start();
			currentColor = newColor;
		}, 5100);
	}

	function getRandomColor() {
		var o = Object.create(null);
		o['r'] = Math.random();
		o['g'] = Math.random();
		o['b'] = Math.random();
		return o;
	}

	return {
		fullscreen: fullscreen,
		startRandomColorTween: startRandomColorTween,
		getRandomColor: getRandomColor
	}
}

module.exports = ThreeHelpers;