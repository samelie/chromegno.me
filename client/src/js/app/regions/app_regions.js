// app dependencies
var App = require('../app');

// define module
App.module('Regions', function(Regions, App, Backbone, Marionette, $, _) {

	// region manager class
	Regions.RegionManager = Marionette.RegionManager.extend({

		initialize: function() {
			// define regions
			var data = {};
			data['nav'] = '#nav-region';
			data['content'] = '#content-region';
			this.addRegions(data);
		}
	});
	
	Regions.get = function(regionId) {
		return Regions.instance.get(regionId);
	};

	// helpers
	Regions.show = function(regionId, view) {
		if (!view) return;
		var region = Regions.instance.get(regionId);
		if (region) {
			region.show(view);
		}
	};

	Regions.add = function(constant, selector) {
		if (!Regions.instance) return;
		var r = {};
		r[constant] = selector;
		Regions.instance.addRegions(r);
	};

	// instance
	Regions.instance = new Regions.RegionManager();

});

// export
module.exports = App.Regions;