var fs = require('fs');
var _ = require('lodash');
var uuid = require('node-uuid');
var Q = require('q');
var ffmpeg = require('fluent-ffmpeg');
var YT = require('ytdl-core');
var request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

'use strict';
var SETTINGS = {
    segmentsPerVideo:1,
    segmentDuration:12,
    
};

var SEGMENT_VO = {
    startTime: undefined,
    endTime: undefined,
    name: undefined
};

module.exports = {

    formatTitle: function(title) {
        var newTitle = title.replace(/\s/g, '_');
        newTitle = newTitle.toLowerCase();
        return newTitle.replace(/[^\w\s]/gi, '')
    },
    
    getInfo: function(id) {
        return Q.denodeify(YT.getInfo)('https://www.youtube.com/watch?v=' + id);
    },

    /////////////////////
    //FFMPEG
    /////////////////////
    createSegments: function(vo) {
        var options = SETTINGS;
        //that annoying subscribe time ppl put at end, seconds, TODO!!!!!!!!
        var videoEndBuffer = Math.ceil(20 / options.segmentDuration);
        var dur = vo['duration'];
        if (options.segmentDuration > dur) {
            return;
        }
        vo['segments'] = [];
        //choose the slots
        var maxSegments = Math.floor(dur / options.segmentDuration);
        if (dur > 5) {
            //it will not sample from last segments
            maxSegments -= videoEndBuffer;
        }
        var usedSegments = Math.min(options.segmentsPerVideo, maxSegments);
        var slots = [];
        while (slots.length < usedSegments) {
            var i = slots.length;
            var pos = Math.floor(Math.random() * maxSegments);
            while (slots.indexOf(pos) !== -1) {
                pos = Math.floor(Math.random() * maxSegments);
            }
            slots[i] = pos;
        }
        for (var i = 0; i < slots.length; i++) {
            var seg = _.clone(SEGMENT_VO);
            vo['segments'].push(seg);
            seg['startTime'] = slots[i] * options.segmentDuration;
            seg['endTime'] = seg['startTime'] + options.segmentDuration;
            seg['name'] = vo['title'] + '_' + uuid.v1();
            console.log('\t ', vo['youtube_id'], 'startTime: ', seg['startTime']);
        }
    },

    getFFMPEGProbe: function(vo, url) {
        var defer = Q.defer();
        ffmpeg.ffprobe(url, function(err, info) {
            if (err || !info) {
                if (err) {
                    console.log("Error on probe");
                }
                if (!info) {
                    console.log("No info");
                }
                defer.reject(vo);
                return defer.promise;
            }
            if (info) {
                vo['info'] = info;
                if (!vo['info']['streams'][0]) {
                    console.log("Doesn't have video streams");
                    defer.reject(vo);
                } else if (vo['info']['streams'][0].duration === 'N/A') {
                    console.log("No duration");
                    defer.reject(vo);
                } else {
                    vo['duration'] = Math.floor(vo['info']['streams'][0].duration);
                    defer.resolve(vo);
                }
            }
        });
        return defer.promise;
    }
};