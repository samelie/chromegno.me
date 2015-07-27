'use strict';
var SHADERS = require('../common/shaders');
THREE.CopyShader = SHADERS.copy;
THREE.MaskPass = require('./post/MaskPass');
THREE.RenderPass = require('./post/RenderPass');
THREE.ShaderPass = require('./post/ShaderPass');
require('./post/EffectComposer');
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
	var effects = {
		bleach:new THREE.ShaderPass(SHADERS.bleach),
		glitch:new THREE.ShaderPass(SHADERS.glitch),
		copy:new THREE.ShaderPass(SHADERS.copy),
		dot:new THREE.ShaderPass(SHADERS.dot),
		kaleido:new THREE.ShaderPass(SHADERS.kaleido)
	};

	var renderPass = new THREE.RenderPass(scene, camera);
	var effectCopy = new THREE.ShaderPass(SHADERS.copy);
	effectCopy.renderToScreen = true;

	var composer = new THREE.EffectComposer(renderer, fbo);
	composer.addPass(renderPass);
	//composer.addPass(effects.glitch);
	composer.addPass(effects.kaleido);
	composer.addPass(effects.bleach);
	composer.addPass(effects.copy);

	/*function animate() {
		render();
		window.requestAnimationFrame(animate);
	}*/

	function render() {
		composer.render();
	}

	function updateUniforms(uniforms){
		var effect = effects[uniforms['shader']];
		_.forIn(uniforms['uniforms'],function(val, key){
			console.log(effect['uniforms'][key]);
			effect['uniforms'][key].value = val;
		});
	}

	return {
		updateUniforms:updateUniforms,
		render:render
	}

};

module.exports = Effects;