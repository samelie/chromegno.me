'use strict';
var TWEEN = require('tweenjs');
var SHADERS = require('../common/shaders');
var OPTIONS = require('../common/shader_options');
var SETTINGS = require('../common/shader_settings');

var Effects = function(scene, camera, renderer, fbo) {

	var updateCounter = 0;
	var secondCounter = 0;
	var currentEffectChapter = undefined;
	var effectIndex = 0;

	var changeEffects = undefined;
	var currentEffectIndex = [];

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
		rgbShift: new THREE.ShaderPass(SHADERS.rgbShift)
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

	changeEffects = [effects.bit, effects.pixelate, effects.bleach, effects.dot, effects.edge, effects.glitch, effects.kaleido, effects.twist, effects.rgbShift];

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
		var currentEffect = currentEffectChapter[effectIndex];
		currentEffectIndex = [];
		var i = 0;
		for (i; i < currentEffect[1]; i++) {
			var ran = Math.floor(Math.random() * changeEffects.length)
			while (currentEffectIndex.indexOf(ran) !== -1) {
				ran = Math.floor(Math.random() * changeEffects.length);
			}
			currentEffectIndex.push(ran);
		}
		_tweenDownEffects(currentEffectIndex.splice(0,2));
		i = 0;
		for (i; i < currentEffect[1]; i++) {}
	}

	function _tweenDownEffects(indexs) {
		for (var i = 0; i < indexs.length; i++) {
			var effect = changeEffects[indexs[i]];
			var name;
			for(var k in effect){
				name = k;
			}
			var option = OPTIONS[name];
			//TWEEN DOWN TO MIN VALUE THEN DISABLE
		}
	}

	function render() {
		updateCounter++;
		if (updateCounter % 60 === 0) {
			secondCounter++;
			_onNewEffect();
			updateCounter = 0;
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