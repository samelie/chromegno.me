'use strict';
var TWEEN = require('tweenjs');
var SHADERS = require('../common/shaders');
var OPTIONS = require('../common/shader_options');
var SETTINGS = require('../common/shader_settings');

var EFFECT_FPS = 2;

var Effects = function(scene, camera, renderer, fbo, name) {

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

	var _otherFbo;

	var effects = {
		bit: new THREE.ShaderPass(SHADERS.bit),
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
	composer.addPass(effects.rgb);
	composer.addPass(effects.pixelate);
	composer.addPass(effects.bleach);
	composer.addPass(effects.bit);
	composer.addPass(effects.dot);
	composer.addPass(effects.edge);
	composer.addPass(effects.color);
	composer.addPass(effects.kaleido);
	composer.addPass(effects.twist);
	composer.addPass(effects.rgbShift);
	composer.addPass(effects.copy);

	changeEffects = [
		[effects.rgb, 'rgb'],
		[effects.bit, 'bit'],
		[effects.pixelate, 'pixelate'],
		[effects.bleach, 'bleach'],
		[effects.dot, 'dot'],
		[effects.edge, 'edge'],
		[effects.glitch, 'glitch'],
		[effects.kaleido, 'kaleido'],
		[effects.twist, 'twist'],
		[effects.rgbShift, 'rgbShift']
	];

	function _updateEffects() {
		//effects.blend['uniforms']['tDiffuse1'].value = fbo;
		if (_otherFbo) {
			//effects.blend['uniforms']['tDiffuse2'].value = _otherFbo;
		}
	}

	function _checkCurrentEffect() {
		var currentEffect = currentEffectChapter[effectIndex];
		if (secondCounter >= currentEffect[0]) {
			effectIndex++;
			_onNewEffect();
		}
	}

	function _onNewEffect() {
		currentEffectController = currentEffectChapter[effectIndex];
		currentEffectIndexs = [];
		randomOffsets = [];
		var i = 0;
		for (i; i < currentEffectController[1]; i++) {
			var ran = Math.floor(Math.random() * changeEffects.length)
			while (currentEffectIndexs.indexOf(ran) !== -1) {
				ran = Math.floor(Math.random() * changeEffects.length);
			}
			ran = i;
			_enableEffect(ran);
			currentEffectIndexs.push(ran);
		}
		/*_tweenDownEffects(currentEffectIndexs.splice(0,
			2));
		i = 0;
		for (i; i < currentEffectController[1]; i++) {

		}*/
	}

	function _enableEffect(index) {
		var effect = changeEffects[index][0];
		var option = OPTIONS[changeEffects[index][1]];
		maxValues[changeEffects[index][1]] = [];
		effect.enabled = true;
		for (var k in option) {
			var val = option[k];
			if (typeof val === 'object') {
				maxValues[changeEffects[index][1]].push([k, val['max']]);
				randomOffsets.push(Math.floor(Math.random() * 1000));
			}
		}
	}

	function _tweenDownEffects(indexs) {
		for (var i = 0; i < indexs.length; i++) {
			var effect = changeEffects[indexs[i]][0];
			var name;
			for (var k in effect) {
				name = k;
			}
			var option = OPTIONS[name];
			//TWEEN DOWN TO MIN VALUE THEN DISABLE
		}
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
				var cos = Math.cos((fpsCounter) * factor);
				effect['uniforms'][values[i2][0]].value = cos * max;
				if (i2 === 0 && name === 'two') {
					console.log(cos);
					//console.log(effect['uniforms'][values[i2][0]].value);
				}
			}
		}
	}

	function render() {
		updateCounter++;
		if (updateCounter % EFFECT_FPS === 0) {
			fpsCounter++;
			if (updateCounter % 60 === 0) {
				secondCounter++;
				_checkCurrentEffect();
			}
			_changeEffectValues();
		}
		composer.render();
	}

	function setOtherFbo(f) {
		_otherFbo = f;
		_updateEffects();
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

	return {
		setEffectsManifest: setEffectsManifest,
		updateUniforms: updateUniforms,
		setOtherFbo: setOtherFbo,
		render: render
	}

};

module.exports = Effects;