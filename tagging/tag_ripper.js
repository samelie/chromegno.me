var fs = require('fs-extra');
var Q = require('q');
var colors = require('colors');
var ffmpeg = require('fluent-ffmpeg');
var _ = require('lodash');
var path = require('path');
var request = require('request');
var dir = require('node-dir');
var rimraf = require('rimraf');

var UTILS = require('./youtube_utils');
var VIDEO_VO = {
	tryCount: 0,
	title: undefined,
	id: undefined,
	captionUrl: undefined,
	item: undefined,
	info: undefined,
	path: undefined,
	results: undefined, //youtube results
	defer: undefined,
	segments: undefined
};
var RESOLUTIONS = ['480p', '360p'];
var OPTIONS = {
	maxRetries: 4,
	searchDepth: 10,
	videosPerKeyword: 30
};

var RIPPER = (function() {

	'use strict';

	var _callback;
	var chosenIds;

	//-----------------------
	//API
	//-----------------------
	function getManifest(callback) {
		var path = './data.json';
		fs.readFile(path, 'utf8', function(err, data) {
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			data = JSON.parse(data);
			_getFolders(data, callback);
		});
	}

	function _getFolders(data, callback) {
		var count = 0;
		var total = 0;
		var assetPath = path.join(process.cwd(), 'assets/youtube');

		function __readFolder(clip, chapterPath, i) {
			var clipPath = path.join(chapterPath, i.toString());
			if (!fs.existsSync(clipPath)) {
				console.log("NO FOLDER");
				return;
			}
			dir.files(clipPath, function(err, files) {
				if (err) throw err;
				clip['youtube'] = [];
				_.each(files, function(absPath) {
					var o = Object.create(null);
					o['absPath'] = absPath;
					o['path'] = absPath.split('/');
					o['path'] = o['path'].splice(7, o['path'].length);
					o['path'] = o['path'].join('/');
					clip['youtube'].push(o);
				});
				count++;
				if (total === count) {
					callback(data);
				}
			});
		}


		_.each(data, function(chapter, index) {
			var chapterPath = path.join(assetPath, index.toString());
			if (!fs.existsSync(chapterPath)) {
				console.log("NO FOLDER");
				return;
			}
			total += chapter.length;
			_.each(chapter, function(clip, i) {
				__readFolder(clip, chapterPath, i);
			});
		});
	}

	//----------------------------
	function start(callback) {
		_callback = callback;
		_parseManifest();
	}

	function _parseManifest() {
		var path = './data.json';
		fs.readFile(path, 'utf8', function(err, data) {
			if (err) {
				console.log('Error: ' + err);
				return;
			}

			data = JSON.parse(data);

			_createFolders(data);
		});
	}


	function _createFolders(data) {
		var assetPath = path.join(process.cwd(), 'assets/youtube');
		rimraf(assetPath, __onFolderDeleted);

		function __onFolderDeleted() {

			fs.mkdirSync(assetPath);

			_.each(data, function(chapter, index) {
				var chapterPath = path.join(assetPath, index.toString());
				fs.mkdirSync(chapterPath);
				_.each(chapter, function(clip, i) {
					var clipPath = path.join(chapterPath, i.toString());
					fs.mkdirSync(clipPath);
					clip['dir'] = clipPath;
				});
			});

			_readTagJson();
			_prepData(data);
			//_callback(data);
		}
	}

	function _readTagJson(data) {

	}
	//-----------------------
	//QUERY
	//-----------------------
	function _prepData(data) {
		var clips = [];
		_.each(data, function(chapter, index) {
			_.each(chapter, function(clip, i) {
				clips.push(clip);
				console.log(clip);
			});
		});

		_startYoutube(clips).then(function(r) {
			_download(clips);
		});
	}

	function _startYoutube(clips) {
		chosenIds = [];
		var defer = Q.defer();
		var promises = [];
		var searchPromises = [];

		_.each(clips, function(clip) {
			_.each(clip['querys'], function(query) {
				query['youtubeResults'] = Object.create(null);
				searchPromises.push(_search(query['q'], query));
			});
		});

		Q.all(searchPromises)
			.then(function() {
				searchPromises = null;
				var count = 0;
				_.each(clips, function(clip) {
					console.log(clip);
					_.each(clip['querys'], function(query) {
						query['vos'] = [];
						for (var i = 0; i < OPTIONS.videosPerKeyword; i++) {
							var vo = _.clone(VIDEO_VO);
							vo['defer'] = Q.defer();
							vo['results'] = query['youtubeResults'];
							query['vos'].push(vo);
							var p = vo['defer']['promise'];
							p.then(function(v) {
								count++;
								console.log(count);
							});
							promises.push(p);
							_chooseVideoItem(vo);
						}
					});
				});

				Q.all(promises)
					.then(function(results) {
						console.log(colors.cyan('Finished youtube query with %s videos'), promises.length);
						defer.resolve(results);
					})
					.catch(function(err) {
						console.log(colors.red('FAILED'));
					})
					.done();
				return defer.promise;
			})
			.catch(function(err) {
				defer.reject(null);
			})
			.done();

		return defer.promise;
	}

	/*GET ALL THE RESULTS FOR A QUERY*/
	function _search(keyword, query) {
		var defer = Q.defer();
		var part = 'snippet';
		var type = 'video';
		var pageToken = '';
		var videoDuration = 'any';
		var maxResults = 50;
		var order = 'relevance';
		var videoCaption = 'any';

		var youtubeSearchResults = [];
		var searchCount = 0;

		var params = {
			part: part,
			//use the title
			q: keyword,
			videoCaption: videoCaption,
			videoDuration: videoDuration,
			maxResults: maxResults,
			type: type,
			safeSearch: 'none',
			order: order,
			key: process.env.YOUTUBE_API_KEY
		};

		function _ytRequest(params) {
			request({
				url: 'https://www.googleapis.com/youtube/v3/search',
				qs: params
			}, function(err, response, body) {
				if (err) {
					console.log(err);
					defer.reject(err);
					return;
				}
				var r = JSON.parse(body);
				if (r['items'].length === 0) {
					params['q'] = 'random';
					_ytRequest(params);
					return;
				}
				searchCount++;
				params['pageToken'] = r['nextPageToken'];
				youtubeSearchResults = youtubeSearchResults.concat(r['items']);
				if (searchCount === OPTIONS['searchDepth']) {
					query['youtubeResults'] = _.flattenDeep(youtubeSearchResults);
					defer.resolve();
				} else {
					_ytRequest(params);
				}
			});
		}

		_ytRequest(params);

		return defer.promise;
	}

	function _chooseVideoItem(videoVo) {
		var item = _chooseRandomVideo(videoVo['results']);
		if (chosenIds.indexOf(item['id']['videoId']) !== -1) {
			_chooseVideoItem(videoVo);
			return;
		}

		videoVo['item'] = item;
		videoVo['youtube_id'] = item['id']['videoId'];
		videoVo['title'] = UTILS.formatTitle(item['snippet']['title']);
		console.log('\t', colors.green('Started: ', videoVo['title'], item['id']['videoId']));
		UTILS.getInfo(item['id']['videoId'])
			.then(function(data) {
				videoVo['vid'] = data['video_id'];
				var choice = [];
				//get only mp4s
				var filter = {
					container: 'mp4'
				};
				var mp4s = _.where(data['formats'], filter);
				//try and get the best resolution
				for (var i = 0; i < RESOLUTIONS.length; i++) {
					if (choice.length > 0) {
						break;
					}
					choice = _.where(mp4s, {
						'resolution': RESOLUTIONS[i]
					});
				}
				//try again if ran out of tries
				if (choice.length === 0 && videoVo['tryCount'] < options['maxRetries']) {
					videoVo['tryCount']++;
					console.log(colors.blue('Bad resolution. try count: %s', videoVo['tryCount']));
					_chooseVideoItem(videoVo);
					return;
				}
				var url = choice[0]['url'];
				videoVo['path'] = url;
				UTILS.getFFMPEGProbe(videoVo, url)
					.then(function(videoVo) {
						UTILS.createSegments(videoVo);
						if (!videoVo['segments']) {
							_chooseVideoItem(videoVo);
						} else {
							chosenIds.push(videoVo['vid']);
							console.log('\t\t', colors.green('Success: ', videoVo['title']));
							videoVo['defer'].resolve(videoVo);
						}
					})
					.catch(function(videoVo) {
						console.log(colors.blue('Bad probe'));
						_chooseVideoItem(videoVo);
					})
					.done();
			})
			.catch(function(err) {
				console.log(err);
				console.log(colors.blue('Bad info search'));
				_chooseVideoItem(videoVo);
			})
			.done();
	}

	function _chooseRandomVideo(result) {
		var ran = Math.floor(Math.random() * result.length);
		return result[ran];
	}



	//-----------------------
	//DOWNLOAD
	//-----------------------

	function _download(clips) {
		var clipIndex = 0;

		//clip has querys
		function __ripClip() {
			var clip = clips[clipIndex];
			if (!clip) {
				console.log("ALL RIPPED");
				return;
			}
			var savePath = clip['dir'];
			var queryIndex = 0;

			function ___onQueryRipsComplete() {
				queryIndex++;
				___ripQuery();
			}

			function ___ripQuery() {
				var query = clip['querys'][queryIndex];
				if (!query) {
					clipIndex++;
					__ripClip();
					return;
				}
				console.log(query);
				var vos = query['vos'];
				_ripClipVideos(savePath, vos, ___onQueryRipsComplete);
			}

			___ripQuery();
		}
		__ripClip();

	}

	//will be like 30 in VOs
	function _ripClipVideos(savePath, vos, callback) {
		var videoIndex = 0;

		function __ripVideo(vo) {
			if (!vo) {
				callback();
				return;
			}
			var name = vo['title'] + '.mp4';
			//only one segment
			var seg = vo['segments'][0];
			console.log(seg);
			var p = savePath + '/' + name;
			ffmpeg(vo['path'])
				.inputOptions('-threads 8')
				.seekInput(seg.startTime)
				.outputOptions('-map 0')
				.outputOptions('-r 25')
				.outputOptions('-profile:v Baseline')
				.outputOptions('-g 12')
				.outputOptions('-c:a aac')
				.outputOptions('-b:a 240k')
				.outputOptions('-strict -2')
				.duration(seg.endTime - seg.startTime)
				.format('mp4')
				.output(p)
				.on('start', function(commandLine) {
					console.log(colors.green('Spawned Ffmpeg with command: %s'), commandLine);
				})
				.on('error', function(err) {
					console.log('An error occurred: ' + err.message);
				})
				.on('end', function() {
					vo['savePath'] = p;
					videoIndex++;
					__ripVideo(vos[videoIndex]);
				})
				.run();
		}

		__ripVideo(vos[videoIndex]);
	}

	return {
		start: start,
		getManifest: getManifest
	}
})();

module.exports = RIPPER;