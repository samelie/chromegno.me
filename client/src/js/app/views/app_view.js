// app dependencies
var App = require('../app');
// define module
App.module('Views', function(Views, App, Backbone, Marionette, $, _) {
    Views.App = Marionette.LayoutView.extend({
        template: JST['app'],
        regions:{
            contentz:'#content'
        },
        events: {
            'click .js-shader': 'onShader',
            'click .js-composer': 'onComposer'
        },
        initialize: function(options) {
        },
        onRender: function() {},
        onShow: function() {
        },
        onShader: function() {
            this.shaderView = new App.Views.ShaderView();
            App.Regions.show('content', this.shaderView);
            //this.contentz.show(this.shaderView);
        },
        onComposer: function() {
            this.composerView = new App.Views.Composer();
            App.Regions.show('content', this.composerView);
            //this.contentz.show(this.shaderView);
        }
    });
});

// export
module.exports = App.Views;