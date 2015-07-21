'use strict';

var Q = require('q');
var aws = require('aws-sdk');
var request = require('request');
var mime = require('mime');
var s3Upload = require('s3');
var S3 = new aws.S3();
var s3Stream = require('s3-upload-stream')(S3);
var _ = require('lodash');
var path = require('path');
var dir = require('node-dir');
var fs = require('fs-extra');
var exec = require('child_process').exec;
var xml2js = require('xml2js');
var XMLHttpRequest = require('xhr2');

var SIDX = (function() {
	'use strict';
	var _clips, _parser;

	function start(clips, callback) {
		_parser = new xml2js.Parser();
		var uploadClient = s3Upload.createClient({
			s3Options: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
			}
		});
		_clips = clips;
		_uploadAll().then(function() {
			callback(_clips);
		}).done();
	}

	function _uploadAll() {
		var defer = Q.defer();
		var index = 0;
		var promises = [];
		_.each(_clips, function(clip) {
			clip['defer'] = Q.defer();
			promises.push(clip['defer'].promise);
		});
		/*_clips[0]['defer'] = Q.defer();
		promises.push(_clips[0]['defer'].promise);*/

		Q.all(promises)
			.then(function(results) {
				_clipSidx().then(function() {
					defer.resolve();
				}).done();
			})
			.catch(function(err) {})
			.done();

		function __ripClip() {
			if (!_clips[index]) {
				return;
			}
			_clips[index]['defer'].promise.then(function() {
				index++;
				__ripClip();
			});
			_uploadClip(_clips[index]);
		}

		__ripClip();

		return defer.promise;
	}

	function _uploadClip(clipObj) {
		var dashed = clipObj['dashed'];
		var count = 0;
		var total = dashed.length;

		function __uploadVideo(obj) {
			var p = obj['video'];
			var key = p.split('/');
			var key = key.splice(7, key.length);
			key = key.join('/');

			function ___upload() {
				var read = fs.createReadStream(p);
				console.log(p, key);
				var upload = s3Stream.upload({
					Bucket: process.env.S3_BUCKET,
					Key: key,
					ACL: 'public-read',
					ContentType: mime.lookup(p)
				});

				upload.on('error', function(error) {
					console.log(error);
				});

				upload.on('uploaded', function(details) {
					obj['url'] = details['Location'];
					count++;
					if (count === total) {
						clipObj['defer'].resolve();
					}
				});
				read.pipe(upload);
			}

			var params = {
				Bucket: process.env.S3_BUCKET,
				Key: key
			};
			var url = S3.getSignedUrl('getObject', params);

			function __exististCallback(exists) {
				if (exists) {
					obj['url'] = url;
					console.log(url);
					count++;
					if (count === total) {
						clipObj['defer'].resolve();
					}
				} else {
					___upload();
				}
			}
			_checkExistance(url, __exististCallback);
		}

		_.each(dashed, function(o) {
			__uploadVideo(o);
		});
	}

	function _checkExistance(url, callback) {
		request({
			url: url
		}, function(err, resp, body) {
			callback(body.length > 1000);
		});
	}

	///-----------------------
	//SIDX
	///-----------------------

	function _clipSidx() {
		var defer = Q.defer();
		var index = 0;
		var promises = [];
		_.each(_clips, function(clip) {
			clip['defer'] = Q.defer();
			promises.push(clip['defer'].promise);
		});
		/*_clips[0]['defer'] = Q.defer();
		promises.push(_clips[0]['defer'].promise);*/

		function __ripClip() {
			if (!_clips[index]) {
				return;
			}
			_clips[index]['defer'].promise.then(function() {
				console.log("sidx ", index);
				index++;
				__ripClip();
			});
			_sidxSeg(_clips[index]);
		}

		__ripClip();

		return Q.all(promises);
	}

	function _sidxSeg(clipObj) {
		var count = 0;
		var dashed = clipObj['dashed'];
		var total = dashed.length;

		function __getIndexRange(obj) {
			var url = obj['url'];
			var parsed = obj['parsedMpd'];
			var xhr = new XMLHttpRequest();
			console.log(url);
			xhr.open('GET', url);
			xhr.setRequestHeader("Range", "bytes=" + parsed['indexRange']);
			xhr.send();
			xhr.responseType = 'arraybuffer';
			try {
				xhr.addEventListener("readystatechange", function() {
					if (xhr.readyState == xhr.DONE) {
						obj['sidx'] = require('./parse_sidx').parseSidx(xhr.response);
						if (!obj['sidx']) {

						}
						count++;
						if (count === total) {
							clipObj['defer'].resolve();
						} else {
							__getIndexRange(dashed[count]);
						}
					}
				}, false);
			} catch (e) {}
		}
		__getIndexRange(dashed[count]);
	}

	return {
		start: start
	}
})();

module.exports = SIDX;