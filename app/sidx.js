'use strict';

var Q = require('q');
var aws = require('aws-sdk');
var mime = require('mime');
var s3Upload = require('s3');
var s3Stream = require('s3-upload-stream')(new aws.S3());
var _ = require('lodash');
var path = require('path');
var dir = require('node-dir');
var fs = require('fs-extra');
var exec = require('child_process').exec;
var xml2js = require('xml2js');
var XMLHttpRequest = require('xhr2');

var SIDX = (function() {
	'use strict';
	var _clips;

	function start(clips) {
		var uploadClient = s3Upload.createClient({
			s3Options: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
			}
		});
		_clips = clips;
		_uploadAll();
		//console.log(clips);
	}

	function _uploadAll() {
		var defer = Q.defer();
		var promises = [];
		_clips[0]['dashed']
		promises.push(_uploadClip(_clips[0]['dashed']));
		/*_.each(_clips, function(clip) {
			promises.push(_uploadClip(clip['dashed']));
		});*/
		Q.all(promises)
			.then(function(results) {
				//defer.resolve(blockVo);
			})
			.catch(function(err) {})
			.done();
		return defer.promise;
	}

	function _uploadClip(clipObj) {
		var count = 0;
		var total = clipObj.length;
		var defer = Q.defer();

		function __uploadVideo(obj) {
			var p = obj['video'];
			var read = fs.createReadStream(p);
			var key = p.split('/');
			var key = key.splice(5, key.length);
			key = key.join('/');
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
				obj['upload'] = details;
				count++;
				if (count === total) {
					console.log(clipObj);
					defer.resolve();
				}
			});
			read.pipe(upload);
		}

		_.each(clipObj, function(o) {
			__uploadVideo(o);
		});

		return defer.promise;
	}

	function _sidxClip(obj) {

	}

	function _sidxSeg(obj, url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.setRequestHeader("Range", "bytes=" + seg['clip']['mpd']['indexRange']);
		xhr.send();
		xhr.responseType = 'arraybuffer';
		try {
			xhr.addEventListener("readystatechange", function() {
				if (xhr.readyState == xhr.DONE) { // wait for video to load
					// Add response to buffer
					seg['clip']['mpd']['sidx'] = require('../../common/sidx').parseSidx(xhr.response);
					if (!seg['clip']['mpd']['sidx']) {
						seg['clip']['dud'] = true;
					}
					defer.resolve(seg);
				}
			}, false);
		} catch (e) {
			defer.resolve(seg);
		}
	}

	return {
		start: start
	}
})();

module.exports = SIDX;