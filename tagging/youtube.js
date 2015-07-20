var colors = require('colors');
var _ = require('lodash');
var ffmpeg = require('fluent-ffmpeg');
var Q = require('q');
var request = require('request');
var fs = require('fs');
var path = require('path');
var YT = require('ytdl-core');
var DIRECTORY = require('../common/directory')

var UTILS = require('./youtube_utils');
var VIDEO_VO = require('./youtube_vo');
var SEGMENT_VO = require('./youtube_segment_vo');

var binaryPath = path.resolve(__dirname, '../../binaries');
var YOUTUBE_KEY = process.env.YOUTUBE_API_KEY;
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
var resolutions = ['480p', '360p'];

var YoutubeMixer = (function() {

    var chosenIds = undefined;
    var OPTIONS  = {
    };

    function start(keywordGroups) {
        chosenIds = [];
        var defer = Q.defer();
        var promises = [];
        var searchPromises = [];

        _.each(keywordGroups, function(keywords) {
            _.each(keywords,function(word){
                searchPromises.push(_search(word));
            });
        });

        Q.all(searchPromises)
            .then(function(results) {
                searchPromises = null;
                var count = 0;
                console.log(results);
                /*_.each(results, function(result) {
                    for (var i = 0; i < options.videosPerKeyword; i++) {
                        var vo = _.clone(VIDEO_VO);
                        vo['defer'] = Q.defer();
                        vo['results'] = result;
                        var p = vo['defer']['promise'];
                        promises.push(p);
                        _chooseVideoItem(vo);
                    }
                });

                Q.all(promises)
                    .then(function(results) {
                        console.log(chosenIds);
                        console.log(colors.red('Finished youtube query with %s videos'), promises.length);
                        defer.resolve(results);
                    })
                    .catch(function(err) {
                        defer.reject(null);
                    })
                    .done();
                return defer.promise;*/
            })
            .catch(function(err) {
                defer.reject(null);
            })
            .done();

        return defer.promise;

    }

    function _search(keyword) {
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
            key: YOUTUBE_KEY
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
                //if noitems
                if (r['items'].length === 0) {
                    params['q'] = 'random';
                    _ytRequest(params);
                    return;
                }
                searchCount++;
                params['pageToken'] = r['nextPageToken'];
                youtubeSearchResults = youtubeSearchResults.concat(r['items']);
                if (searchCount === options['searchDepth']) {
                    defer.resolve(youtubeSearchResults);
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
        chosenIds.push(videoVo['youtube_id']);
        videoVo['title'] = UTILS.formatTitle(item['snippet']['title']);
        console.log('\t', colors.green('Started: ', videoVo['title'], item['id']['videoId']));
        UTILS.getInfo(item['id']['videoId'])
            .then(function(data) {
                videoVo['captionUrl'] = UTILS.extractCaptionUrl(data['caption_tracks'], data['video_id']);
                var choice = [];
                //get only mp4s
                var filter = {
                    container: 'mp4',
                    audioEncoding: options['audio'] ? 'aac' : 'null'
                };
                var mp4s = _.where(data['formats'], filter);
                //try and get the best resolution
                for (var i = 0; i < resolutions.length; i++) {
                    if (choice.length > 0) {
                        break;
                    }
                    choice = _.where(mp4s, {
                        'resolution': resolutions[i]
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
                console.log('\t\t', colors.green('Started: ', videoVo['title']));
                UTILS.getFFMPEGProbe(videoVo, url)
                    .then(function(videoVo) {
                        //extract frames
                        //console.log(colors.red(videoVo['title'], ' succeeded with ', videoVo['segments'].length, ' segments'));
                        _extractFrames(videoVo)
                            .then(function(vo) {
                                UTILS.createSegments(vo, options);
                                vo['defer'].resolve(vo);
                            })
                            .catch(function(vo) {
                                console.log(colors.blue('Frame where the same!'));
                                _chooseVideoItem(vo);
                            })
                            .done();
                    })
                    .catch(function(vo) {
                        console.log(colors.blue('Bad probe'));
                        _chooseVideoItem(vo);
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

    function _extractFrames(vo) {
        var defer = Q.defer();
        var middle = Math.floor(vo['info']['streams'][0].duration / 2);
        var times = [middle, middle + 1];
        var directory = DIRECTORY.getTemp();

        var outputs = [];
        var count = 0;
        _.each(times, function(seekTime, index) {
            var output = directory + '/' + vo['youtube_id'] + '_' + index + '.jpg';
            outputs.push(output);
            ffmpeg(vo['path'])
                .inputOptions('-threads 8')
                .seekInput(seekTime)
                .size('256x?')
                .outputOptions('-vframes 1')
                .outputOptions('-f image2')
                .output(output)
                .on('error', function(err) {
                    console.log('An error occurred: ' + err.message);
                })
                .on('end', function() {
                    count++;
                    if (count === times.length) {
                        _compareFrames(vo, outputs, defer);
                    }
                })
                .run();
        });

        return defer.promise;
    }

    function _compareFrames(vo, paths, defer) {
        var child_process = require('child_process');
        var command = process.env.COMPARE_PATH + ' -metric RMSE ' + paths[0] + ' ' + paths[1] + ' null:';
        child_process.exec(command, function(err, stdout, stderr) {
            if (!stderr || stderr === '') {
                defer.resolve(vo);
                return;
            }
            var val = parseInt(stderr.split(" ")[0], 10);
            //no change really
            if (val < 10) {
                defer.reject(vo);
            } else {
                defer.resolve(vo);
            }
        });
    }
    return {
        start: start
    }

})();

module.exports = YoutubeMixer;