'use strict';
var TWEEN = require('tweenjs');
var SHADERS = require('../common/shaders');
var OPTIONS = require('../common/shader_options');
var SETTINGS = require('../common/shader_settings');

var EFFECT_FPS = 2;

var Effects = function(scene, camera, renderer, fbo, name) {

	var smallCounter = 0;
	var updateCounter = 0;
	var fpsCounter = 0;
	var secondCounter = 0;
	var currentEffectChapter = undefined;
	var currentEffectController = undefined;
	var effectIndex = 0;

	var changeEffects = undefined;
	var randomOffsets = [];
	var maxValues = Object.create(null);
	var currentEffectIndexs = [];
	var constantEffects = undefined;

	var _otherFbo;
	var _otherTexture;
	var _cos = 0;

	var effects = {
		bit: new THREE.ShaderPass(SHADERS.bit),
		chroma: new THREE.ShaderPass(SHADERS.chroma),
		mega: new THREE.ShaderPass(SHADERS.mega),
		displacement: new THREE.ShaderPass(SHADERS.displacement),
		pixelate: new THREE.ShaderPass(SHADERS.pixelate),
		bleach: new THREE.ShaderPass(SHADERS.bleach),
		blend: new THREE.ShaderPass(SHADERS.blend),
		color: new THREE.ShaderPass(SHADERS.color),
		copy: new THREE.ShaderPass(SHADERS.copy),
		dot: new THREE.ShaderPass(SHADERS.dot),
		edge: new THREE.ShaderPass(SHADERS.edge),
		glitch: new THREE.ShaderPass(SHADERS.glitch),
		kaleido: new THREE.ShaderPass(SHADERS.kaleido),
		twist: new THREE.ShaderPass(SHADERS.twist),
		rgbShift: new THREE.ShaderPass(SHADERS.rgbShift),
		rgb: new THREE.ShaderPass(SHADERS.rgb)
	};


	_.forIn(effects, function(effect, key) {
		if (OPTIONS[key]) {
			effect['enabled'] = OPTIONS[key]['enabled'];
		}
	});

	var renderPass = new THREE.RenderPass(scene, camera);
	var effectCopy = new THREE.ShaderPass(SHADERS.copy);
	effectCopy.renderToScreen = true;

	//effects.glitch['uniforms']['tDisp'].value = new THREE.ImageUtils.loadTexture('assets/img/hero.jpg');


	var composer = new THREE.EffectComposer(renderer, fbo);
	composer.addPass(renderPass);
	//composer.addPass(effects.blend);
	//composer.addPass(effects.dot);
	//composer.addPass(effects.mega);
	composer.addPass(effects.color);
	composer.addPass(effects.rgb);
	composer.addPass(effects.pixelate);
	composer.addPass(effects.bleach);
	composer.addPass(effects.bit);
	//composer.addPass(effects.edge);
	composer.addPass(effects.kaleido);
	//composer.addPass(effects.twist);
	//composer.addPass(effects.rgbShift);
	composer.addPass(effects.copy);

	changeEffects = [
		//[effects.mega, 'mega'],
		[effects.rgb, 'rgb'],
		//[effects.bit, 'bit'],
		[effects.pixelate, 'pixelate'],
		[effects.bleach, 'bleach']
		//[effects.dot, 'dot'],
		//[effects.edge, 'edge'],
		//[effects.glitch, 'glitch'],
		//[effects.kaleido, 'kaleido']
		//[effects.twist, 'twist'],
		//[effects.rgbShift, 'rgbShift']
	];

	constantEffects = [effects.color, effects.bit];

	function fftUpdate(data) {
		data[0] *= 1.8; //more bass
		var con = 1;
		if(name === 'one'){
			//con = _map(data[0], 0, 1, -4, -0.02);
		}else{
			con = _map(data[0], 0, 1, 1, 4);
		}
		var sat = _map(data[1], 0, 1, 0, 6);
		var hue = _map(data[2], 0, 1, 0, 4);
		effects.color['uniforms']['uContrast'].value = con;
		effects.color['uniforms']['uSaturation'].value = sat;
		effects.color['uniforms']['uHue'].value = hue;

		var bit = _map(data[1], 0, 1, 0.5, 7);
		effects.bit['uniforms']['bitSize'].value = bit;
	}

	function _changeEffectValue(name, val) {
		effects[name]['uniforms']['bitSize'].value *= (1+val);
		if(name === 'one'){
			//console.log((1+val));
		}
	}

	function _updateEffects() {
		if (_otherTexture) {

		}
	}

	function _checkCurrentEffect() {
		if (!currentEffectChapter) {
			return;
		}
		var currentEffect = currentEffectChapter[effectIndex];
		if (secondCounter >= currentEffect[0]) {
			secondCounter = 0;
			effectIndex++;
			_onNewEffect();
		}
	}

	function _onNewEffect() {
		currentEffectController = currentEffectChapter[effectIndex];
		randomOffsets = [];
		var i = 0;
		var l = currentEffectIndexs.length;
		for (i; i < l; i++) {
			_disableEffect(currentEffectIndexs[i]);
		}
		i = 0;
		l = currentEffectController[1];
		currentEffectIndexs = [];
		for (i; i < l; i++) {
			var ran = Math.floor(Math.random() * changeEffects.length)
			while (currentEffectIndexs.indexOf(ran) !== -1) {
				ran = Math.floor(Math.random() * changeEffects.length);
			}
			_enableEffect(ran);
			currentEffectIndexs.push(ran);
		}
	}

	function _enableEffect(index) {
		var effect = changeEffects[index][0];
		var option = OPTIONS[changeEffects[index][1]];
		maxValues[changeEffects[index][1]] = [];
		effect.enabled = true;
		for (var k in option) {
			var val = option[k];
			if (typeof val === 'object') {
				if (val['enabled']) {
					maxValues[changeEffects[index][1]].push([k, val['max'], val['min']]);
					randomOffsets.push(Math.floor(Math.random() * 1000));
				}
			}
		}
	}

	function _disableEffect(index) {
		var effect = changeEffects[index][0];
		var option = OPTIONS[changeEffects[index][1]];
		var obj = Object.create(null);
		for (var k in option) {
			var val = option[k];
			if (typeof val === 'object') {
				if (val['enabled']) {
					obj[k] = Object.create(null);
					obj[k].value = val['min'];
				}
			}
		}
		new TWEEN.Tween(effect['uniforms'])
			.to(obj, 2000)
			.easing(TWEEN.Easing.Cubic.Out)
			.onComplete(function() {
				effect.enabled = false;
			})
			.start();
	}


	function _changeEffectValues() {
		if (!currentEffectController) {
			return;
		}
		var l = currentEffectIndexs.length;
		var l2 = randomOffsets.length;
		var i = 0;
		var i2 = 0;
		var factor = currentEffectController[2];
		for (i; i < l; i++) {
			var effect = changeEffects[currentEffectIndexs[i]][0];
			var values = maxValues[changeEffects[currentEffectIndexs[i]][1]];
			var previousL = currentEffectIndexs[i - 1] ? maxValues[changeEffects[currentEffectIndexs[i - 1]][1]].length : 0;
			i2 = 0;
			l2 = values.length;
			for (i2; i2 < l2; i2++) {
				var seed = randomOffsets[i2 + previousL];
				var max = values[i2][1];
				var min = values[i2][2];
				_cos = Math.abs(Math.cos((smallCounter + seed) * factor));
				_changeEffectValue('bit', _cos);
				var val = _map(_cos, 0, 1, min, max);
				effect['uniforms'][values[i2][0]].value = val;
				if (i2 === 0 && name === 'two') {
					//console.log(cos);
					//console.log(smallCounter);
					//console.log(effect['uniforms'][values[i2][0]].value);
				}
			}
		}
	}

	function render() {
		smallCounter += 0.001;
		updateCounter++;
		if (updateCounter % 60 === 0) {
			secondCounter++;
			_checkCurrentEffect();
		}
		_changeEffectValues();
		TWEEN.update();
		composer.render();
	}

	function setOtherFbo(f) {
		_otherFbo = f;
		//_updateEffects();
	}

	function setOtherTexture(t) {
		_otherTexture = t;
		//_updateEffects();
	}


	function updateUniforms(uniforms) {
		var obj = uniforms['uniforms'];
		var effect = effects[uniforms['shader']];
		effect.enabled = obj['enabled'];
		_.forIn(obj, function(val, key) {
			if (_.isObject(val)) {
				if (effect['uniforms'][key]) {
					effect['uniforms'][key].value = val[key];
				}
			}
		});
	}

	function setEffectsManifest(manifest) {
		currentEffectChapter = manifest.shift();
		_onNewEffect();
	}

	function _map(v, a, b, x, y) {
		return (v === a) ? x : (v - a) * (y - x) / (b - a) + x;
	}

	function getCos(){
		return _cos;
	}

	return {
		setEffectsManifest: setEffectsManifest,
		updateUniforms: updateUniforms,
		setOtherTexture: setOtherTexture,
		setOtherFbo: setOtherFbo,
		fftUpdate: fftUpdate,
		getCos: getCos,
		render: render
	}

};

module.exports = Effects;