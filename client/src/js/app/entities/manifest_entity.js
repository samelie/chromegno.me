// app dependencies
var App = require('../app');
var Q = require('q');
// define module
App.module('Entities', function(Entities, App, Backbone, Marionette, $, _) {

    function _getManifest() {
        var defer = Q.defer();
        Q($.ajax({
            type: 'GET',
            url: 'assets/json/videos_manifest2.json'
        })).then(function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    }

   App.reqres.setHandler('reqres:manifest', _getManifest);

});

// export
module.exports = App.Entities;