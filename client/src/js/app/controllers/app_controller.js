// app dependencies
var App = require('../app');

// define module
App.module('AppController', function(AppController, App, Backbone, Marionette, $, _) {
	// controller class
	AppController.Controller = Marionette.Controller.extend({

		initialize: function() {
			// listen to events
			this.createViews();
		},

		createViews: function() {
			this.appView = new App.Views.App();
			App.Regions.show('nav', this.appView);
		}
	});

	// instance
	AppController.instance = new AppController.Controller();
});

// export
module.exports = App.AppController;