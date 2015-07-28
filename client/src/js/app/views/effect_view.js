var App = require('../app');
var dat = require('dat-gui');
var Stats = require('stats');
var SHADERS_LIB = require('../common/shader_lib');
var THREE_SCENE = require('../common/three_scene');
var SCENE = require('../common/scene');
var UTILS = require('../common/utils');
var FX_OPTIONS = require('../common/shader_options');
// app dependencies
var NUM_COLUMNS = 2;
var VIDEO_WIDTH = 1280;
var VIDEO_HEIGHT = 853;
var MAX_ASPECT = 2.31;

var statsEnabled = true;

var container, stats, loader;
var camera, scene, renderer;

var geometry;
var planes;
var videoPlane, videoMaterial, textMaterial, textMaterialSide, textMaterialFront, textMaterialArray, textColor = new THREE.Color(0xFF000);
var texture1, texture2, texture3, video, sceneA, sceneB;
var planesGroup;

//Normal map shader
var ambient = 0xffffff,
	diffuse = 0xffffff / 5,
	specular = 0xffffff,
	scale = 143;

var textMesh, textGeo;

var spotLight, pointLight, ambientLight;
var isRender = true;

var mouseX = 0;
var mouseY = 0;

var controls;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// define module
App.module('Views', function(Views, App, Backbone, Marionette, $, _) {

	'use strict';

	Views.FX = Marionette.ItemView.extend({
		template: JST['effect_view'],
		events: {
			'click .js-go': 'startProcess'
		},
		initialize: function(options) {},
		onRender: function() {
			this.updateCounter = 0;
			this.guiOptions = Object.create(null);
			this.guiOptions['uMixRatio'] = 0.01;
			this.guiOptions['uThreshold'] = 0.01;
			this.guiOptions['uSaturation'] = 0.01;
			//gui
		},
		onShow: function() {

			var self = this;
			var gui = new dat.GUI();
			var main = gui.addFolder('main');
			main.add(this.guiOptions, 'uMixRatio', 0, 1).onChange(function(val) {
				videoMaterial.uniforms["uMixRatio"].value = this.guiOptions['uMixRatio'];
			}.bind(this));

			main.add(this.guiOptions, 'uThreshold', 0, .5).onChange(function() {
				videoMaterial.uniforms["uThreshold"].value = this.guiOptions['uThreshold'];
			}.bind(this));

			main.add(this.guiOptions, 'uSaturation', 0, 10.).onChange(function() {
				videoMaterial.uniforms["uSaturation"].value = this.guiOptions['uSaturation'];
			}.bind(this));
			var optionsA = gui.addFolder('sceneA');
			var optnsFolder = [];
			var options = _.cloneDeep(FX_OPTIONS);
			_.forIn(options, function(obj, key) {
				var f = optionsA.addFolder(key);
				optnsFolder.push(f);
				obj['enabled'] = false;
				_.forIn(obj, function(v, k) {
					var b = Object.create(null);
					b['uniforms'] = obj;
					b['shader'] = key;
					f.add(obj, k, 0.01, 10.0).onChange(function(val) {
						sceneA.updateUniforms(this);
					}.bind(b));
				});
			});

			var optnsFolder2 = [];
			var optionsB = gui.addFolder('sceneB');
			var options = _.cloneDeep(FX_OPTIONS);
			_.forIn(options, function(obj, key) {
				var f = optionsB.addFolder(key);
				optnsFolder2.push(f);
				_.forIn(obj, function(v, k) {
					var b = Object.create(null);
					b['uniforms'] = obj;
					b['shader'] = key;
					f.add(obj, k, 0.01, 10.0).onChange(function(val) {
						sceneB.updateUniforms(this);
					}.bind(b));
				});
			});
			//optionsA.

			gui.width = 300;

			this.videoElement = document.getElementById('myVideo');
			this.videoElement.volume = 0;
			this.videoElement.width = VIDEO_WIDTH;
			this.videoElement.height = VIDEO_HEIGHT;

			this.videoElement2 = document.getElementById('myVideo2');
			this.videoElement2.volume = 0;
			this.videoElement2.width = VIDEO_WIDTH;
			this.videoElement2.height = VIDEO_HEIGHT;

			this.videoElement3 = document.getElementById('mixer');
			this.videoElement3.volume = 0;
			this.videoElement3.width = VIDEO_WIDTH;
			this.videoElement3.height = VIDEO_HEIGHT;

			this.gui = gui;
			this.setup3D();
		},

		////------------------------
		//3D
		////------------------------

		setup3D: function() {
			var Z_DIS = 400;
			renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.getElementById('three').appendChild(renderer.domElement);

			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			this.el.appendChild(stats.domElement);

			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
			camera.position.set(0, 0, Z_DIS);

			texture1 = new THREE.Texture(this.videoElement);
			texture1.minFilter = THREE.LinearFilter;
			texture1.magFilter = THREE.LinearFilter;

			texture2 = new THREE.Texture(this.videoElement2);
			texture2.minFilter = THREE.LinearFilter;
			texture2.magFilter = THREE.LinearFilter;

			texture3 = new THREE.Texture(this.videoElement3);
			texture3.minFilter = THREE.LinearFilter;
			texture3.magFilter = THREE.LinearFilter;

			//texture3 = new THREE.ImageUtils.loadTexture('../img1.jpg');
			var scaleObj = UTILS.onAspectResize();

			sceneA = new SCENE(renderer, 0xffffff, Z_DIS);
			sceneA.createPlane(scaleObj.w, scaleObj.h, new THREE.MeshBasicMaterial({
				map: texture1
			}));

			sceneB = new SCENE(renderer, 0x000000, Z_DIS);
			sceneB.createPlane(scaleObj.w, scaleObj.h, new THREE.MeshBasicMaterial({
				map: texture2
			}));

			var d = SHADERS_LIB['mix']();
			var shader = d['shader'];
			var uniforms = d['uniforms'];
			uniforms["tOne"].value = sceneA.fbo;
			uniforms["tTwo"].value = sceneB.fbo;
			uniforms["tMix"].value = texture3;
			uniforms["uMixRatio"].value = this.guiOptions['uMixRatio'];
			uniforms["uThreshold"].value = this.guiOptions['uThreshold'];

			var parameters = {
				fragmentShader: shader.fragmentShader,
				vertexShader: shader.vertexShader,
				uniforms: uniforms
			};
			var quadgeometry = new THREE.PlaneGeometry(scaleObj.w, scaleObj.h, 4, 4);
			//THREE.GeometryUtils.center(quadgeometry);

			videoMaterial = new THREE.ShaderMaterial(parameters);

			scene = new THREE.Scene();

			this.quad = new THREE.Mesh(quadgeometry, videoMaterial);
			scene.add(this.quad);

			scene.add(this.quad);

			this.boundAnimate = this.animate.bind(this);
			this.boundAnimate();

			window.addEventListener('resize', this.onWindowResize.bind(this), false);

			this.onWindowResize();
		},
		onWindowResize: function() {
			var w = window.innerWidth;
			var h = window.innerHeight;
			camera.aspect = w / h;
			console.log(UTILS.onAspectResize(w, h));
			var scale = 1;
			scale = UTILS.onAspectResize(w, h).scale
			/*if (w / h > MAX_ASPECT) {
				scale = 1 + w / h / MAX_ASPECT;
			} else {
				scale = 1
			}*/
			scale = 1;
			this.quad.scale.x = this.quad.scale.y = scale;
			renderer.setSize(w, h)
			sceneA.resize(w, h, scale);
			sceneB.resize(w, h, scale);
		},
		handleResize: function(w, h) {
			console.log(w, h);
		},
		animate: function() {
			window.requestAnimationFrame(this.boundAnimate);
			this.threeRender();
			stats.update();
		},

		threeRender: function() {
			texture1.needsUpdate = true;
			texture2.needsUpdate = true;
			texture3.needsUpdate = true;
			videoMaterial.uniforms.uMixRatio.value = this.guiOptions['uMixRatio'];
			videoMaterial.uniforms.uThreshold.value = this.guiOptions['uThreshold'];
			if (this.guiOptions['uMixRatio'] == 0) {
				sceneB.render();
			} else if (this.guiOptions['uMixRatio'] == 1) {
				sceneA.render();
			} else {
				sceneA.render();
				sceneB.render();
			}
			renderer.render(scene, camera, null, true);
		}

	});
});

// export
module.exports = App.FX;