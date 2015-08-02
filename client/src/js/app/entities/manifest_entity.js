// app dependencies
var App = require('../app');
var Q = require('q');
// define module
App.module('Entities', function(Entities, App, Backbone, Marionette, $, _) {

    function _getManifest() {
        var defer = Q.defer();
        Q($.ajax({
            type: 'GET',
            url: 'assets/json/videos_manifest.json'
        })).then(function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    }

    function _getEffects() {
        var defer = Q.defer();
        Q($.ajax({
            type: 'GET',
            url: 'assets/json/effect_durations.json'
        })).then(function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    }

    function _getYoutube() {
        var defer = Q.defer();
        Q($.ajax({
            type: 'GET',
            url: 'assets/json/youtube_manifest.json'
        })).then(function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    }

    function _getMade() {
        var defer = Q.defer();
        Q($.ajax({
            type: 'GET',
            url: 'assets/json/made_manifest.json'
        })).then(function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    }

    function _getGnome() {
        var defer = Q.defer();
        Q($.ajax({
            type: 'GET',
            url: 'assets/json/gnome_manifest.json'
        })).then(function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    }

    App.reqres.setHandler('reqres:made', _getMade);
    App.reqres.setHandler('reqres:gnome', _getGnome);
    App.reqres.setHandler('reqres:youtube', _getYoutube);
    App.reqres.setHandler('reqres:effects', _getEffects);
    App.reqres.setHandler('reqres:manifest', _getManifest);

});

// export
module.exports = App.Entities;