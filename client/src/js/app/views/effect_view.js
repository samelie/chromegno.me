var App = require('../app');
var dat = require('dat-gui');
var Stats = require('stats');
var SHADERS_LIB = require('../common/shader_lib');
var THREE_SCENE = require('../common/three_scene');
var SCENE = require('../common/scene');
var UTILS = require('../common/utils');
var FX_OPTIONS = require('../common/shader_options');
var TIMELINE = require('../common/timeline');
var FOLDER_PLAYER = require('../common/folder_player');
var THREE_HELPERS = require('../common/three_helpers');
var WEBCAM = require('../common/webcam');
var THREE_HELPERS = require('../common/three_helpers');
var PLAYER = require('../common/player_controller');
var KEVIN = require('../common/kevin_player');
var AUDIO = require('../common/audio_analyser');
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
var texture1, texture2, texture3, video, sceneA, sceneB, mixer;
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
var _pitchArray = [];

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
		initialize: function(options) {
			this.timeline = new TIMELINE();
			App.reqres.request('reqres:manifest').then(function(manifest) {
				this.manifest = this.timeline.start(manifest);
				this.setupPlayer();
				App.reqres.request('reqres:youtube').then(function(youtube) {
					//this.playerController.setYoutubeManifest(document.getElementById('myVideo'), youtube);
					App.reqres.request('reqres:effects').then(function(effects) {
						this.setupEffects(effects);
						this.audio = new AUDIO();
						this.audio.addTrack('assets/audio/chrome.mp3');
					}.bind(this)).done();
				}.bind(this)).done();
			}.bind(this)).done();
		},
		setupPlayer: function() {
			this.playerController = new PLAYER(this._onChapterComplete.bind(this));
			this.playerController.init(document.getElementById('myVideo2'));
			console.log(this.manifest);
			this.playerController.setEntireManifest(this.manifest);
		},
		onRender: function() {
			this.updateCounter = 0;
			this.guiOptions = Object.create(null);
			this.guiOptions['uMixRatio'] = 0.01;
			this.guiOptions['uThreshold'] = 0.01;
			this.guiOptions['uSaturation'] = 0.01;
			//gui
		},
		onShow: function() {

			this.threeHelpers = new THREE_HELPERS();

			var self = this;

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

			this.kevinPlayer = new KEVIN();
			this.kevinPlayer.init(document.getElementById('kevin'), this._resume.bind(this));

			App.reqres.request('reqres:made').then(function(made) {
				var options = {
					probability: 0.93,
					files: ["key1.mp4"]
				};
				this.madePlayer = new FOLDER_PLAYER(this.videoElement, made, options);
				this.madePlayer.start();
			}.bind(this)).done();

			this.webcam = new WEBCAM(this.videoElement3);
			App.reqres.request('reqres:gnome').then(function(gnome) {
				var options = {
					probability: 0.85,
					files: ["How_Its_Made_s02e13_Ball_Bearings_-_Electrical_Wires_-_Lost_Wax_Process_Casting_-_Automated_Machines_3.mp4"]
				};
				this.gnomePlayer = new FOLDER_PLAYER(this.videoElement3, gnome, options);
				//this.gnomePlayer.setWebcamSwap(this.webcam);
				this.gnomePlayer.start();
			}.bind(this)).done();

			document.addEventListener('keyup', function(e) {
				switch (e.keyCode) {
					case 13:
						this.threeHelpers.fullscreen();
						document.getElementById('three').style.display = 'block';
						break;

				}
			}.bind(this));

			this.setup3D();
		},

		////------------------------
		//3D
		////------------------------

		setup3D: function() {
			var Z_DIS = 400;
			this.$threeEl = $(document.getElementById('three'));
			renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			renderer.setSize(window.innerWidth, window.innerHeight);
			this.$threeEl[0].appendChild(renderer.domElement);

			/*stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			this.el.appendChild(stats.domElement);*/

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

			var scaleObj = UTILS.onAspectResize();

			this.threeHelpers = new THREE_HELPERS();

			sceneA = new SCENE(renderer, 0xffffff, Z_DIS, 'one');
			sceneA.createPlane(scaleObj.w, scaleObj.h, new THREE.MeshBasicMaterial({
				map: texture1
			}));

			sceneB = new SCENE(renderer, 0x000000, Z_DIS, 'two');
			sceneB.createPlane(scaleObj.w, scaleObj.h, new THREE.MeshBasicMaterial({
				map: texture2
			}));

			//sceneA.fx.setOtherFbo(sceneB.fbo);
			sceneA.fx.setOtherTexture(texture2);
			//sceneB.fx.setOtherFbo(sceneA.fbo);
			sceneB.fx.setOtherTexture(texture1);

			var d = SHADERS_LIB['mix']();
			var shader = d['shader'];
			var uniforms = d['uniforms'];
			uniforms["tDiffuse"].value = sceneA.fbo;
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

			this.boundAnimate = this.animate.bind(this);
			this.boundAnimate();

			window.addEventListener('resize', this.onWindowResize.bind(this), false);

			this.onWindowResize();
		},
		setupEffects: function(manifest) {
			sceneA.setEffectsManifest(manifest.splice(0, 4));
			sceneB.setEffectsManifest(manifest.splice(0, 4));
		},
		_onChapterComplete: function(chapterIndex) {
			console.log("CCHAPTER COMPLETE");
			if (chapterIndex % 2 === 0) {
				this._pause();
			}
		},
		_pause: function() {
			this.audio.fadeDown();
			setTimeout(function() {
				document.getElementById('chrome').style.display = 'none';
				this.$threeEl.addClass('hide');
				this.playerController.pause();
				window.cancelAnimationFrame(this.requestId);
				setTimeout(function() {
					this.kevinPlayer.start();
				}.bind(this), 10000);
			}.bind(this), 10000);
		},
		_resume: function() {
			setTimeout(function() {
				document.getElementById('chrome').style.display = 'block';
				this.$threeEl.removeClass('hide');
				this.playerController.resume();
				this.audio.fadeUp();
				this.animate();
			}.bind(this), 10000);
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
			this.requestId = window.requestAnimationFrame(this.boundAnimate);
			if (this.audio) {
				var fft = this.audio.getFFT();
				var pitch = this.audio.getPitch();
				this._updateWithPitch(pitch);
				videoMaterial.uniforms["uSaturation"].value = this._map(fft[4], 0, 1, 1, 2.5);
				sceneA.fx.fftUpdate(fft);
				sceneB.fx.fftUpdate(fft);
			}
			this.threeRender();
			//stats.update();
		},

		//0-11
		_updateWithPitch: function(pitch) {
			if (pitch) {
				var p = this._storeAndGetPitch(pitch);
				var mod = 0.3;
				if (this.playerController.getChapterIndex() > 1) {
					mod = 0.07;
				}
				videoMaterial.uniforms["uMixRatio"].value = p - mod;
			}
			if (sceneA) {
				videoMaterial.uniforms["uThreshold"].value = .7 * sceneA.fx.getCos();
			}
		},

		_map: function(v, a, b, x, y) {
			return (v === a) ? x : (v - a) * (y - x) / (b - a) + x;
		},

		_storeAndGetPitch: function(p) {
			var v = p;
			if (_pitchArray.length < 20) {
				_pitchArray.push(p);
				return v;
			} else {
				_pitchArray.unshift(p);
				_pitchArray.pop();
				var l = _pitchArray.length;
				var t = 0;
				for (var i = 0; i < l; i++) {
					t += _pitchArray[i];
				}
				return t / l;
			}
		},

		threeRender: function() {
			texture1.needsUpdate = true;
			texture2.needsUpdate = true;
			texture3.needsUpdate = true;
			sceneA.render();
			sceneB.render();
			renderer.render(scene, camera, null, true);
		}

	});
});

// export
module.exports = App.FX;