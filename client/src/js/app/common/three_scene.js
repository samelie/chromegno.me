var P_WIDTH = 256;
var P_HEIGHT = 256;
var P_DEPTH = 256;
var TIME_BIAS = -1000;
var TWEEN = require('tweenjs');

'use strict';

var Three = function() {
	'use strict';

	var _container, _animateCallback;

	var _camera, _scene, _renderer, _lightGroup, _ambientLight, _controls;

	var windowHalfX, windowHalfY;

	function init(container, animateCallback) {

		_container = container;
		_animateCallback = animateCallback;

		_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		_camera.position.set(0, 0, 1400);

		_scene = new THREE.Scene();

		_renderer = new THREE.WebGLRenderer();
		_renderer.setSize(window.innerWidth, window.innerHeight);
		_container.appendChild(_renderer.domElement);

		// LIGHTS
		_lightGroup = new THREE.Object3D();
		_scene.add(_lightGroup);
		_lightGroup.position.z = 4000;

		var gLight = new THREE.AmbientLight(0xefefef);
		_scene.add(gLight);

		_ambientLight = new THREE.SpotLight(0xffffff);

		var light = new THREE.SphereGeometry(40, 4, 4);
		var lMesh = new THREE.Mesh(light, new THREE.MeshBasicMaterial({
			wireframe: true
		}));

		//_lightGroup.add(lMesh);
		_lightGroup.add(_ambientLight);

		_controls = new THREE.TrackballControls(_camera, _renderer.domElement);
		_controls.minDistance = 400;
		_controls.maxDistance = 1000;
		_renderer.gammaInput = true;
		_renderer.gammaOutput = true;

		animate();

		window.addEventListener('resize', onWindowResize, false);

		return _scene;
	}

	///------------------
	//API
	///------------------

	///--------------------------
	//PRIVATED
	///--------------------------


	//resize
	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		_camera.updateProjectionMatrix();
		_renderer.setSize(window.innerWidth, window.innerHeight);
	}
	//render
	function animate() {
		TWEEN.update();
		window.requestAnimationFrame(animate);
		threeRender();
	}

	function threeRender() {
		_controls.update();
		_animateCallback();
		_lightGroup.position.copy(_camera.position);
		_lightGroup.rotation.copy(_camera.rotation);
		_renderer.render(_scene, _camera);
	}

	return {
		init:init
	}
};

module.exports = Three;