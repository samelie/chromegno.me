require('../entities/segment_entity');
var App = require('../app');
var dat = require('dat-gui');
var Stats = require('stats');
var TWEEN = require('tweenjs');
var SHADERS = require('../common/shaders');
// app dependencies
var NUM_COLUMNS = 2;
var VIDEO_WIDTH = 1280;
var VIDEO_HEIGHT = 720;


var CHANNEL_IDS = ['UCcTHInOcdMcVlEuwbC6b2Gw','UCLA_DiR1FfKNvjuUpBHmylQ', 'UCEsp7_7MeS48OMw9sIM1gzQ'];

var TEXT_SHOW_DURATION = 180;
var canShowText = true;
var DEFAULT_TEXT = 'SPACE PARTY';
var VERBS = require('../common/three_words').verbs;
var PREPOSITIONS = require('../common/three_words').prepos;
var ADJECTIVES = require('../common/three_words').adjectives;
var FONTS = ['nasa', 'termin','montroc','futurearth','megatron', 'prometheus', 'spaceage', 'starjedi', 'unrealtournament'];
var LOG_PLAYER = false;
var LOG_THREE = true;

var statsEnabled = true;

var container, stats, loader;
var camera, scene, renderer;

var geometry;
var planes;
var videoPlane, videoMaterial, textMaterial, textMaterialSide, textMaterialFront, textMaterialArray, textColor = new THREE.Color(0xFF000);
var texture, feedbackTexture, video;

var textMesh, textGeo;
var textAnimating = false;
var textOptions = {
	size: 30,
	height: 20,
	curveSegments: 4,
	font: "spaceage",
	weight: "normal",
	style: "normal",
	bevelThickness: 2,
	bevelSize: 2,
	bevelEnabled: true,
	material: 0,
	extrudeMaterial: 1
};
var objectController = {
	pos: {
		x: 0,
		y: 0,
		z: 0
	},
	rot: {
		x: 0,
		y: 0,
		z: 0
	}
};

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

	Views.YoutubeThreeView = Marionette.ItemView.extend({
		template: JST['youtube_three'],
		events: {
			'click .js-go': 'startProcess'
		},
		initialize: function(options) {
			var self = this;
			this.guiOptions = Object.create(null);
			this.guiOptions['resetCamera'] = this.resetCamera;
			this.guiOptions['zoomRandomPlane'] = this.zoomRandomPlane.bind(this);
			this.guiOptions['topLeft'] = this.topLeft.bind(this);
			this.guiOptions['topRight'] = this.topRight.bind(this);
			this.guiOptions['bottomLeft'] = this.bottomLeft.bind(this);
			this.guiOptions['bottomRight'] = this.bottomRight.bind(this);
			this.guiOptions['topLeftRot'] = this.topLeftRot.bind(this);
			this.guiOptions['topRightRot'] = this.topRightRot.bind(this);
			this.guiOptions['bottomLeftRot'] = this.bottomLeftRot.bind(this);
			this.guiOptions['bottomRightRot'] = this.bottomRightRot.bind(this);
			this.guiOptions['numberOfPlanes'] = 1;
			this.guiOptions['enableColor'] = true;
			this.guiOptions['saturation'] = 0.01;
			this.guiOptions['contrast'] = 0.01;
			this.guiOptions['desaturate'] = 0.01;
			this.guiOptions['brightness'] = 0.01;
			this.guiOptions['hue'] = 0.01;
			this.guiOptions['enableAberation'] = false;
			this.guiOptions['tvAberationDelay'] = .5;
			this.guiOptions['feedbackDelay'] = 0.001;
			this.guiOptions['uDisplacementScale'] = 37;

			App.on('events:youtube:keywords', this.onKeywords, this);
			App.on('events:midi:receive', this.onMidi, this);

		},
		onRender: function() {},
		onShow: function() {
			var self = this;
			this.$textEl = this.$el.find('.ThreeFonts');

			this.videoElement = document.getElementById('myVideo');
			this.videoElement.width = VIDEO_WIDTH;
			this.videoElement.height = VIDEO_HEIGHT;
			var SoundAnalyser = require('../common/sound_analyser');
			var PlayerController = require('../common/player_controller');
			var ThreeHelpers = require('../common/three_helpers');
			var Timeline = require('../common/timeline');

			this.playerController = new PlayerController(this.videoElement);
			this.playerController.setOnNewVo(this.onNewVo.bind(this));
			this.soundAnalyser = new SoundAnalyser();
			this.soundAnalyser.videoStart(this.videoElement);
			this.threeHelpers = new ThreeHelpers();
			this.threeCamera = require('../common/three_camera');

			this.timeline = new Timeline();
			this.timeline.fromChannels(App.Entities.Segment.getChannelManifests(CHANNEL_IDS)).then(function(manifest){
				self.playerController.appendVOs(manifest);
			}).done();
			//this.timeline.getChannels();
			//this.timeline.getChunk(300);

			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			stats.domElement.style.zIndex = 100;
			this.el.appendChild(stats.domElement);

			this.setupCanvas();

			this.boundAnimate = this.animate.bind(this);
			this.setup3D();
			this.boundAnimate();

			//fps
			this.updateCounter = 0;
			this.feedbackDelayCount = Math.floor(this.guiOptions['feedbackDelay'] * 60);
			this.tvAberationDelay = Math.floor(this.guiOptions['tvAberationDelay'] * 60);

			//gui
			var gui = new dat.GUI();
			var cameraControls = gui.addFolder('Camera');
			cameraControls.add(this.guiOptions, 'resetCamera');
			cameraControls.add(this.guiOptions, 'zoomRandomPlane');
			cameraControls.add(this.guiOptions, 'topLeft');
			cameraControls.add(this.guiOptions, 'topRight');
			cameraControls.add(this.guiOptions, 'bottomLeft');
			cameraControls.add(this.guiOptions, 'bottomRight');
			cameraControls.add(this.guiOptions, 'topLeftRot');
			cameraControls.add(this.guiOptions, 'topRightRot');
			cameraControls.add(this.guiOptions, 'bottomLeftRot');
			cameraControls.add(this.guiOptions, 'bottomRightRot');

			gui.add(this.guiOptions, 'enableColor').onChange(function(val) {
				videoMaterial.uniforms['enableColor'].value = val;
			}.bind(this));
			gui.add(this.guiOptions, 'saturation', 0.0, 10.0).onChange(function(val) {
				this.onPeramChanged('uSaturation', val);
			}.bind(this));
			gui.add(this.guiOptions, 'contrast', 0.0, 10.0).onChange(function(val) {
				this.onPeramChanged('uContrast', val);
			}.bind(this));
			gui.add(this.guiOptions, 'desaturate', 0.0, 1.0).onChange(function(val) {
				this.onPeramChanged('uDesaturate', val);
			}.bind(this));
			gui.add(this.guiOptions, 'brightness', 0.0, 4.0).onChange(function(val) {
				this.onPeramChanged('uBrightness', val);
			}.bind(this));
			gui.add(this.guiOptions, 'hue', 0.0, Math.PI * 2).onChange(function(val) {
				this.onPeramChanged('uHue', val);
			}.bind(this));

			gui.add(this.guiOptions, 'enableAberation').onChange(function(val) {
				videoMaterial.uniforms['enableAberation'].value = val;
			}.bind(this));
			gui.add(this.guiOptions, 'numberOfPlanes', 1, 2).step(1).onChange(_.debounce(function(val) {
				this.createPlanes();
			}.bind(this), 300));
			gui.add(this.guiOptions, 'uDisplacementScale', 1, 700).step(1).onChange(function(val) {
				if (planes.length > 1) {
					var currentPos = planes[1].position;
					planes[1].position.set(currentPos.x, currentPos.y, val * 0.5);
				}
				this.onPeramChanged('uDisplacementScale', val);
			}.bind(this));
			gui.add(this.guiOptions, 'feedbackDelay', 0, 2).step(0.01).onChange(function(val) {
				//swap the displacemnt textures
				this.onFeedbackDelayChanged(val);
			}.bind(this));
			gui.add(this.guiOptions, 'tvAberationDelay', 0.01, 2.0).step(0.01).onChange(function(val) {
				this.tvAberationDelay = Math.floor(val * 60);
			}.bind(this));
			gui.width = 300;
			this.gui = gui;

			gui.close();

			//get a segment (random)

			//this._getManifests();
		},

		////////////////////////////
		//MIDI
		////////////////////////////

		onMidi: function(msg) {
			var v = msg[2];
			switch (msg[1]) {
				//fs
				case 28:
					if (v === 1) {
						this.threeHelpers.fullscreen();
					}
					break;
				case 27:
					if (v === 1) {
						this.threeCamera.random(planes[0]);
					}
					break;
				case 26:
					if (v === 1) {
						this.threeCamera.reset(planes[0]);
					}
					break;
				case 1:
					this.threeCamera.changeRX(planes[0], App.Utils.map(v, 0, 1, 0.5, -0.10));
					break;
				case 12:
					this.threeCamera.changeRY(planes[0], App.Utils.map(v, 0, 1, 0.5, -0.10));
					break;
				case 9:
					this.threeCamera.changeRZ(planes[0], App.Utils.map(v, 0, 1, 0, Math.PI * 2));
					break;
				case 0:
					this.threeCamera.changeZ(planes[0], App.Utils.map(v, 0, 1, -1600, 300));
					break;
					//x
				case 11:
					this.threeCamera.changeX(planes[0], App.Utils.map(v, 0, 1, -2200, 2200));
					break;
					//y
				case 2:
					this.threeCamera.changeY(planes[0], App.Utils.map(v, 0, 1, -1300, 1300));
					break;

				case 13:
					var val = this.guiOptions['uDisplacementScale'] = 1200 * v;
					this.onPeramChanged('uDisplacementScale', val);
					break;
					//feedbakc 
				case 14:
					var val = this.guiOptions['feedbackDelay'] = 2 * v;
					this.onFeedbackDelayChanged(val);
					break;
					//on off color
				case 15:
					if (v === 0 || v === 1) {
						videoMaterial.uniforms['enableColor'].value = v;
					}
					break;
				case 16:
					if (v === 0 || v === 1) {
						videoMaterial.uniforms['enableAberation'].value = v;
					}
					break;
				case 3:
					var val = this.guiOptions['uSaturation'] = 10 * v;
					this.onPeramChanged('uSaturation', val);
					break;
				case 4:
					var val = this.guiOptions['uContrast'] = 10 * v;
					this.onPeramChanged('uContrast', val);
					break;
				case 5:
					var val = this.guiOptions['uBrightness'] = 4 * v;
					this.onPeramChanged('uBrightness', val);
					break;
				case 6:
					this.onPeramChanged('uDesaturate', v);
					break;
				case 10:
					var val = this.guiOptions['uHue'] = Math.PI * 2 * v;
					this.onPeramChanged('uHue', val);
					break;
				case 7:
					this.tvAberationDelay = Math.floor(v * 1000);
					break;
			}
			console.log(msg);
		},

		_getManifests: function() {
			var self = this;
			var total = 2;
			var count = 0;
			App.reqres.request('reqres:manifest:sidx')
				.then(function(data) {
					count++;
					self.manifestSidx = data;
					if (count === total) {
						self.__chooseChunk(data);
					}
				})
				.done();
			App.reqres.request('reqres:manifest:clips')
				.then(function(data) {
					count++;
					self.manifestClips = data;
					if (count === total) {
						self.__chooseChunk(data);
					}
				})
				.done();
		},

		__chooseChunk: function(data) {
			var self = this;
			var totalDuration = 0;
			var random = Math.floor(Math.random() * this.manifestSidx.length);
			var sidxUrl = this.manifestSidx.slice(random, random + 1)[0].get('url');
			var clipsUrl = this.manifestClips.slice(random, random + 1)[0].get('url');

			App.Entities.Segment.getChunk(sidxUrl)
				.then(function(chunk) {
					self.playerController.appendVOs(self.timeline.fromManifest(App.Utils.shuffle(chunk)));
				})
				.done();

			App.Entities.Segment.getChunk(clipsUrl)
				.then(function(chunk) {
					self.chunkClips = chunk;
				})
				.done();
		},


		////------------------------
		//3D
		////------------------------

		setup3D: function() {

			planes = [];

			container = document.getElementById('three');
			this.el.appendChild(container);
			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
			camera.position.set(0, 0, 1400);
			camera.rotation.set(0, 0, 0);
			this.threeCamera.setCamera(camera);


			scene = new THREE.Scene();

			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			container.appendChild(renderer.domElement);

			// LIGHTS
			ambientLight = new THREE.AmbientLight(0xffffff);
			scene.add(ambientLight);

			controls = new THREE.TrackballControls(camera, renderer.domElement);

			renderer.gammaInput = true;
			renderer.gammaOutput = true;

			geometry = new THREE.PlaneGeometry(VIDEO_WIDTH * 6, VIDEO_HEIGHT * 6, 480, 270);
			geometry.computeTangents();

			feedbackTexture = new THREE.Texture(this.feedbackCanvasEl);
			feedbackTexture.minFilter = THREE.LinearFilter;
			feedbackTexture.magFilter = THREE.LinearFilter;

			texture = new THREE.Texture(this.videoElement);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;

			//Normal map shader
			var ambient = 0xffffff,
				diffuse = 0xffffff / 5,
				specular = 0xffffff,
				scale = 143;

			var shader = SHADERS["mega"];
			var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

			uniforms["enableDiffuse"].value = true;
			uniforms["enableDisplacement"].value = true;

			uniforms["tDisplacement"].value = feedbackTexture;
			uniforms["tDiffuse"].value = texture;
			uniforms["uDisplacementBias"].value = 1.0;
			uniforms["uDisplacementScale"].value = this.guiOptions['uDisplacementScale'];

			uniforms["uAmbientColor"].value.setHex(ambient);
			uniforms["uDiffuseColor"].value.setHex(diffuse);

			uniforms["uAmbientColor"].value.convertGammaToLinear();
			uniforms["uDiffuseColor"].value.convertGammaToLinear();

			var parameters = {
				fragmentShader: shader.fragmentShader,
				shading: THREE.SmoothShading,
				vertexShader: shader.vertexShader,
				uniforms: uniforms,
				lights: true,
				fog: false,
				map: texture,
				bumpMap: feedbackTexture,
				bumpScale: 20000,
				transparent: false,
				overdraw: true,
				side: THREE.DoubleSide
			};

			videoMaterial = new THREE.ShaderMaterial(parameters);
			textMaterialFront = new THREE.MeshBasicMaterial();
			textMaterialFront.color = textColor;

			textMaterialSide = new THREE.MeshBasicMaterial({
				color: 0x000000
			});
			textMaterialArray = [textMaterialFront, textMaterialSide];
			textMaterial = new THREE.MeshFaceMaterial(textMaterialArray);
			/* textMaterial = new THREE.MeshFaceMaterial([
                new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    shading: THREE.FlatShading
                }), // front
                new THREE.MeshPhongMaterial({
                    color: 0x0000,
                    shading: THREE.SmoothShading
                }) // side
            ]);*/

			this.createPlanes();

			//this.threeCamera.zoomOut();
			//this.threeCamera.zoomOut();
			//this.threeCamera.cyclePlane(planes[0]);
			//this.threeCamera.megaCycle();
			//this.threeCamera.cycleCorners();
			this.threeCamera.cycleCornersRot();

			//text
			//this.createText();

			//textColor
			this.threeHelpers.startRandomColorTween(this.onColorUpdate.bind(this));

			window.addEventListener('resize', this.onWindowResize, false);
		},

		createText: function(text) {
			console.error(text);
			text = text || DEFAULT_TEXT;

			if (textMesh) {
				scene.remove(textMesh);
				textGeo.dispose();
			}
			var fontFamily = FONTS[Math.floor(Math.random() * FONTS.length)];
			console.log(fontFamily);
			textGeo = new THREE.TextGeometry(text, {
				size: 10,
				height: 20,
				curveSegments: 4,
				font: fontFamily,
				weight: "normal",
				style: "normal",
				bevelThickness: 2,
				bevelSize: 2,
				bevelEnabled: true,
				material: 0,
				extrudeMaterial: 1

			});


			THREE.GeometryUtils.center(textGeo);

			textMesh = new THREE.Mesh(textGeo, textMaterial);

			textMesh.position.x = 0 //window.innerWidth / 2;
			textMesh.position.y = -90;
			textMesh.position.z = 200;


			scene.add(textMesh);

		},

		createPlanes: function() {
			if (planes.length) {
				for (var i = 0; i < planes.length; i++) {
					var mesh = planes[i];
					scene.remove(mesh);
					mesh = null;
				}
				planes.length = 0;
			}
			for (var i = 0; i < this.guiOptions['numberOfPlanes']; i++) {
				var mesh = new THREE.Mesh(geometry, videoMaterial);
				mesh.position.set(0, 0, -1500);
				if (this.guiOptions['numberOfPlanes'] > 1) {
					var offset = NUM_COLUMNS * VIDEO_WIDTH / 4;
					mesh.position.set(VIDEO_WIDTH * i - offset, 0, 0);
				}
				if (i % 2 !== 0) {
					mesh.rotation.set(0, Math.PI, 0);
				}
				planes.push(mesh);
				scene.add(mesh);
			}
		},

		setupCanvas: function() {
			var canvas = document.createElement('canvas');
			canvas.style.display = 'none';
			canvas.id = "feedback";
			canvas.width = VIDEO_WIDTH;
			canvas.height = VIDEO_HEIGHT;
			this.el.appendChild(canvas);
			this.feedbackCanvasEl = document.getElementById('feedback');
			this.feedbackContext = this.feedbackCanvasEl.getContext("2d");
		},


		///////////////////////////////////////
		// UPDATE ABLES
		///////////////////////////////////////

		//from player
		onNewVo: function(vo) {
			this.$textEl[0].style.fontFamily = FONTS[Math.floor(Math.random() * FONTS.length)];
			var t = this.getClipText(vo['clip_id']);
			if(t){
				this.$textEl[0].innerHTML = t.toUpperCase();
				console.log(this.$textEl[0].innerHTML);
			}
			//this.createText(this.getClipText(vo['clip_id']));
		},

		//from three helpers
		onColorUpdate: function(obj) {
			this.$textEl[0].style.color = 'rgb(' + Math.floor(obj.r * 255) + ',' + Math.floor(obj.g * 255) + ',' + Math.floor(obj.b * 255) + ')';
			//textColor.setRGB(obj.r, obj.g, obj.b);
		},

		onPeramChanged: function(name, val) {
			var uniforms = videoMaterial.uniforms;
			uniforms[name].value = val;
		},

		onFeedbackDelayChanged: function(val) {
			if (this.feedbackDelayCount !== val && val === 0) {
				videoMaterial['uniforms']["tDisplacement"].value = texture;
			} else if (videoMaterial['uniforms']["tDisplacement"].value !== feedbackTexture && val > 0) {
				videoMaterial['uniforms']["tDisplacement"].value = feedbackTexture;
			}
			this.feedbackDelayCount = Math.floor(val * 60);
		},

		onWindowResize: function() {
			windowHalfX = window.innerWidth / 2;
			windowHalfY = window.innerHeight / 2;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		},

		onDocumentMouseMove: function(event) {
			mouseX = (event.clientX - windowHalfX) * 10;
			mouseY = (event.clientY - windowHalfY) * 10;
		},

		animate: function() {
			window.requestAnimationFrame(this.boundAnimate);
			this.threeRender();
		},

		threeRender: function() {
			//controls.update();
			TWEEN.update();
			if (this.playerController.isReady()) {
				renderer.render(scene, camera);
				//feedback
				if (this.feedbackDelayCount === 0) {
					this.computeFrame(this.feedbackContext, this.videoElement);
				} else {
					if (this.updateCounter % this.feedbackDelayCount === 0) {
						this.computeFrame(this.feedbackContext, this.videoElement);
					}
				}
				if (this.tvAberationDelay === 0) {
					videoMaterial.uniforms['uTime'].value = this.updateCounter;
				} else {
					if (this.updateCounter % this.tvAberationDelay === 0) {
						videoMaterial.uniforms['uTime'].value = this.updateCounter;
					}
				}
				if (this.updateCounter % 120 === 0) {
					//console.log(camera.position, camera.rotation);
				}
				if (this.updateCounter % TEXT_SHOW_DURATION === 0) {
					//console.log(camera.position, camera.rotation);
					canShowText = true;
					this.updateCounter = 0;
				}
				//audio
				//this.computeAudio(this.soundAnalyser.getFrequencies());

			}
			feedbackTexture.needsUpdate = true;
			texture.needsUpdate = true;
			stats.update();
			this.updateCounter++;
		},

		//////////////////////////////
		// CAMERA
		//////////////////////////////
		zoomRandomPlane: function() {
			var o = Object.create(null);
			o.pos = Object.create(null);
			o.pos.x = 0;
			o.pos.y = 0;
			o.pos.z = Math.random() * 400 - 200;

			this.threeCamera.tweenObj(planes[0], o, 1000);
		},
		resetCamera: function() {
			if (!camera) {
				return;
			}
			var t1 = new TWEEN.Tween(camera.position)
				.to({
					x: 0,
					y: 0,
					z: 400
				}, 1500)
				.easing(TWEEN.Easing.Exponential.Out)
				.start();
			var t2 = new TWEEN.Tween(camera.rotation)
				.to({
					x: 0,
					y: 0,
					z: 0
				}, 1500)
				.easing(TWEEN.Easing.Exponential.Out)
				.start();

			controls.reset();
		},

		topLeft: function() {
			this.threeCamera.topLeft(1500);
		},
		topRight: function() {
			this.threeCamera.topRight(1500);
		},
		bottomLeft: function() {
			this.threeCamera.bottomLeft(1500);
		},
		bottomRight: function() {
			this.threeCamera.bottomRight(1500);
		},
		topLeftRot: function() {
			this.threeCamera.topLeftRot(1500);
		},
		topRightRot: function() {
			this.threeCamera.topRightRot(1500);
		},
		bottomLeftRot: function() {
			this.threeCamera.bottomLeftRot(1500);
		},
		bottomRightRot: function() {
			this.threeCamera.bottomRightRot(1500);
		},

		computeFrame: function(context, video) {
			context.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
		},


		////------------------------
		//AUDIO
		////------------------------

		computeAudio: function(data) {
			var total = 0;
			var magnitude;
			var l = data.length;
			for (var i = 0; i < l; i++) {
				magnitude = data[i];
				total += magnitude / 256;
			}
			var average = total / l;
			videoMaterial.uniforms['uDisplacementScale']['value'] = average * 100;
			videoMaterial.uniforms['uSaturation']['value'] = App.Utils.map(average, 0, 1, 0, 10);

			this.animateText(data, average, total);
		},

		////------------------------
		//TEXT ANIMATION
		////------------------------

		getClipText: function(clipId) {
			console.log(TEXT_SHOW_DURATION, canShowText);
			if(!canShowText){
				return undefined;
			}
			canShowText = false;
			TEXT_SHOW_DURATION = Math.floor(Math.random() * 3 + 3 * 60);
			var WORDS = 2;
			var verbs = [];
			var nouns = [];

			var firstNoun, verb, preposition, secondNoun, adjective;

			var vo = this.timeline.getClipDataFromId(clipId);
			var text;
			if (!vo) {
				return DEFAULT_TEXT;
			}
			if (vo['clip_captions']) {
				text = JSON.parse(vo['clip_captions'])['captions'];
				return text[Math.floor(Math.random() * text.length)].toLowerCase();
			} else if (vo['youtube_captions']) {
				text = JSON.parse(vo['youtube_captions'])['captions'];
				return text[Math.floor(Math.random() * text.length)].toLowerCase();
			} else if (vo['keywords']) {
				text = JSON.parse(vo['keywords']).join(' ');
			} else if (vo['clip_keywords_youtube']) {
				text = JSON.parse(vo['clip_keywords_youtube']).join(' ');
			} else {
				text = DEFAULT_TEXT;
				return text;
			}
			var processedText;
			try {
				processedText = NLP.pos(text, {
					dont_combine: true
				});
			} catch (x) {
				return text;
			}

			var tmp = [];
			tmp = tmp.concat(processedText.nouns());
			tmp = tmp.concat(processedText.entities());
			tmp = tmp.concat(processedText.people());

			tmp = _.flattenDeep(tmp);

			_.each(tmp, function(n) {
				nouns.push(n.text);
			})

			tmp.length = 0;
			tmp = null;
			_.each(processedText.verbs(), function(v) {
				verbs.push(v.text);
			})

			firstNoun = nouns[Math.floor(Math.random() * nouns.length)] || 'Space';
			secondNoun = nouns[Math.floor(Math.random() * nouns.length)] || 'Condom';

			verbs = _.merge(verbs, VERBS);

			preposition = PREPOSITIONS[Math.floor(Math.random() * PREPOSITIONS.length)];
			adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
			verb = verbs[Math.floor(Math.random() * verbs.length)];

			var finalText = firstNoun + ' ' + verb + ' ' + preposition + ' ' + secondNoun + ' ' + adjective;
			return finalText.toLowerCase();
		},

		animateText: function(frequencies, average, total) {
			if (average > 0.4) {
				this.spinText();
			}
		},

		spinText: function() {
			var ran = Math.floor(Math.random() * 2);
			var angle;
			if (ran === 0) {
				angle = Math.PI * 11 / 6;
			} else {
				angle = Math.PI / 6;
			}
			if (!textMesh) {
				return;
			}
			if (textAnimating) {
				return;
			}
			textAnimating = true;
			new TWEEN.Tween(textMesh.rotation)
				.to({
					y: angle
				}, 1000)
				.easing(TWEEN.Easing.Exponential.Out)
				.onComplete(function() {
					textAnimating = false;
				})
				.start();
		}

	});
});

// export
module.exports = App.Views.YoutubeThreeView;