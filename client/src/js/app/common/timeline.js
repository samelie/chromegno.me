var Q = require('q');
var Perlin = require('./noise');
var _ = require('lodash');
//seconds
var INTERVAL = 0.5;
var SEQUENCIAL_REFS = false;
var CHAPTER_DURATION = 45; //mins

var flattendData = [];

/*
 
 
 */

var Timeline = function() {
    'use strict';
    var ALL;

    function start(clipsManifest) {
        ALL = [];
        _.each(clipsManifest, function(chapter, i) {
            var o = Object.create(null);
            ALL.push(o);
            o['routes'] = [];
            _buildRoutes(o['routes'], chapter, i);

        });
        return _replaceRoute(clipsManifest, ALL);
    }

    function _buildRoutes(routes, chapter, chapterIndex) {
        var totalDuration = 0;

        function __createRoute() {
            if (totalDuration > (CHAPTER_DURATION * 60)) {
                return;
            }
            var route = [];
            var seed = Math.floor(Math.random() * chapter[0]['videos'].length);
            route.push([0, seed]);
            for (var i = 1; i < chapter.length; i++) {
                var total = chapter[i]['videos'].length;
                var factor = Perlin.getVal(i);
                var min = Math.max(seed - 1, 0);
                var max = Math.min(seed + 1, total - 1);
                var choices = [min, seed, max];
                var choice;
                var norm = i / chapter.length;
                //fast to slow at end
                if (chapterIndex === 3) {
                    norm = 1 - norm;
                }
                var choiceFactor;
                switch (chapterIndex) {
                    case 0:
                    case 3:
                        choiceFactor = (factor + Math.asin(norm)) / 2;
                        choice = choices[Math.floor(_clamp(choices.length * choiceFactor, 0,total))];
                        break;
                    case 1:
                    case 2:
                        choice = choices[Math.floor(_clamp(choices.length * factor, 0,total))];
                        break;
                }
                if (choice !== undefined) {
                    totalDuration += chapter[i]['videos'][choice]['duration'];
                    route.push([i, choice]);
                    seed = choice;
                }
            }
            routes.push(route);
            __createRoute();
        }

        __createRoute();
    }

    function _replaceRoute(manifest, routes){
        var replacedManifest = [];
        _.each(routes,function(routeObj, chapterIndex){
            var videos = manifest[chapterIndex];
            var ch = [];
            _.each(routeObj['routes'],function(route){
                _.each(route,function(data, i){
                    var o = Object.create(null);
                    var item = videos[data[0]];
                    o['chapter'] = chapterIndex;
                    o['index'] = i;
                    o['dir'] = item['dir'];
                    o['clip'] = item['dashed'][data[1]];
                    ch.push(o);
                });
            });
            replacedManifest.push(ch);
        });
        return replacedManifest;
    }

    function _clamp(number, min, max) {
        return Math.max(min, Math.min(number, max));
    }
    //function _createRoute()

    return {
        start: start
    }
}

module.exports = Timeline;