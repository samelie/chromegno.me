'use strict';
var UTILS = require('./utils');
var EFFECTS = require('./effects_scene')

var Scene = function(renderer, clearColor, cameraZ, name) {
	var fbo;

	var _scene, _camera, _clearColor, _mesh;

	_clearColor = clearColor;

	_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	//_camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000);
	_camera.position.z = cameraZ;
	// Setup scene
	_scene = this.scene = new THREE.Scene();
	_scene.add(new THREE.AmbientLight(0x555555));

	var renderTargetParameters = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false
	};

	fbo = this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
	fbo.minFilter = THREE.LinearFilter;
	fbo.magFilter = THREE.LinearFilter;

	var fx = new EFFECTS(_scene, _camera, renderer, fbo, name);

	function render(rtt) {
		//renderer.setClearColor(_clearColor);
		fx.render();
		/*if (rtt) {
			renderer.render(_scene, _camera, fbo, true);
		} else {
			renderer.render(_scene, _camera);
		}*/
	}

	function createPlane(w, h, material) {
		var geometry = new THREE.PlaneGeometry(1280, 720, 256, 144);
		geometry.center();
		_mesh = new THREE.Mesh(geometry, material);
		//_mesh.position.z = -200;
		//_mesh.position.z = -400;
		//_mesh.position.x = ;
		_scene.add(_mesh);
	}

	function resize(w, h, scale) {
		_camera.aspect = w / h;
		_mesh.scale.x = _mesh.scale.y = scale;
		_camera.updateProjectionMatrix();
		//fbo.setSize(w, h);
	}

	function updateUniforms(uniforms){
		fx.updateUniforms(uniforms);
	}

	function setEffectsManifest(manifest){
		fx.setEffectsManifest(manifest);
	}

	return {
		resize: resize,
		render: render,
		fx: fx,
		fbo: fbo,
		updateUniforms: updateUniforms,
		setEffectsManifest: setEffectsManifest,
		createPlane: createPlane
	}
};

module.exports = Scene;