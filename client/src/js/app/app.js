// vendor dependencies
var Marionette = require('marionette');

// constructor
var App = new Marionette.Application();

App.addInitializer(function() {

    // app dependencies in correct order

    // commons
    require('fastclick');

    require('./regions/app_regions');

    require('./entities/manifest_entity');

    require('./views/app_view');
    require('./views/shaders_view');
    require('./views/composer_view');
    require('./controllers/app_controller');
});

// export
module.exports = App;