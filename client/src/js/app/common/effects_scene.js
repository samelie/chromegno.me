'use strict';
var SHADERS = require('../common/shaders');
var OPTIONS = require('../common/shader_options');
var SETTINGS = require('../common/shader_settings');

var Effects = function(scene, camera, renderer, fbo) {

	//var scene = new THREE.Scene();

	// create a camera, which defines where we're looking at.
	//var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

	/*var webGLRenderer = new THREE.WebGLRenderer();
	webGLRenderer.setClearColor(new THREE.Color(0xaaaaff, 1.0));
	webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	webGLRenderer.shadowMapEnabled = true;
	webGLRenderer.antialias = false;*/

	//el.appendChild(webGLRenderer.domElement);
	var _otherFbo;

	var effects = {
		bit: new THREE.ShaderPass(SHADERS.bit),
		bleach: new THREE.ShaderPass(SHADERS.bleach),
		blend: new THREE.ShaderPass(SHADERS.blend),
		color: new THREE.ShaderPass(SHADERS.color),
		copy: new THREE.ShaderPass(SHADERS.copy),
		dot: new THREE.ShaderPass(SHADERS.dot),
		edge: new THREE.ShaderPass(SHADERS.edge),
		glitch: new THREE.ShaderPass(SHADERS.glitch),
		kaleido: new THREE.ShaderPass(SHADERS.kaleido)
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
	composer.addPass(effects.bleach);
	composer.addPass(effects.bit);
	composer.addPass(effects.color);
	/*composer.addPass(effects.dot);
	composer.addPass(effects.edge);
	*/
	composer.addPass(effects.kaleido);
	composer.addPass(effects.copy);

	/*function animate() {
		render();
		window.requestAnimationFrame(animate);
	}*/

	function _updateEffects() {
		//effects.blend['uniforms']['tDiffuse1'].value = fbo;
		if (_otherFbo) {
			//effects.blend['uniforms']['tDiffuse2'].value = _otherFbo;
		}
	}

	function render() {
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

	return {
		updateUniforms: updateUniforms,
		setOtherFbo: setOtherFbo,
		render: render
	}

};

module.exports = Effects;