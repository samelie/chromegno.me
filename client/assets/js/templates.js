this.JST = {"app": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="App">\n\t<!-- <button class="btn btn-default js-three">Three</button>\n\t<button class="btn btn-default js-shader">Shader</button>\n\t<button class="btn btn-default js-composer">Composer</button>\n\t<button class="btn btn-default js-fx">FX</button> -->\n\t<div id="#content"></div>\n</div>';

}
return __p
},
"composer_view": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="ThreeView">\n\t<video id="myVideo" controls autoplay  crossorigin="anonymous" ></video>\n\t<div id="three"></div>\n</div>\n';

}
return __p
},
"effect_view": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="EffectsView">\n\t<video id="myVideo" src="" controls autoplay  crossorigin="anonymous"></video>\n\t<video id="myVideo2" src="" controls autoplay  crossorigin="anonymous"></video>\n\t<video id="mixer" src="" controls autoplay crossorigin="anonymous" ></video>\n\t<video id="kevin" src=""  autoplay  crossorigin="anonymous"></video>\n\n\t<div id="three"></div>\n\t<div class="info"><div>ChromeGnome is an audio visual project exploring the concept of and endless video stream coming from a dataset stimulated by music written by my friend Davor Ivankovic.<br>The piece was part of an art gallery opening in August 2015 for Kevin Tran whose paintings thematically followed a trip across Europe.<br>A background layer of randomised video stream of machines hard at work, is keyed into a layer of endless  linearly and gently fading pictures of Kevin’s trip, by yet another layer of randomised Barcelona antics shot by myself.</div></div>\n\t<span id="chrome">ChromeGno.me</span>\n</div>\n';

}
return __p
},
"live": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="Live">\n\t<div class="Live-bg"></div>\n\t<div class="Button js-pause">PLAY/PAUSE</div>\n\t<div class="Button js-finish">FINISH</div>\n</div>';

}
return __p
},
"select": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="Select">\n\t<div id="results"></div>\n</div>';

}
return __p
},
"select_item": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="SelectItem">' +
((__t = (name)) == null ? '' : __t) +
'</div>';

}
return __p
},
"youtube": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="Youtube">\n\t<div class="Live-bg"></div>\n</div>';

}
return __p
},
"youtube_mix": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="YoutubeMix">\n\t<video id="myVideo" controls autoplay crossorigin="anonymous"></video>\n\t<input id="searchField" class="YoutubeKeywords" type="text" value="comma seperated search terms">\n\t<div class="YoutubeButton js-go">GO</div>\n</div>\n';

}
return __p
},
"youtube_player": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="YoutubePlayer">\n\t<video id="myVideo" controls autoplay  crossorigin="anonymous"></video>\n</div>\n';

}
return __p
},
"youtube_three": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="YoutubeThree">\n\t<video id="myVideo" src="../vid.mp4" loop controls autoplay  crossorigin="anonymous"></video>\n\t<video id="myVideo2" src="../vid2.mp4" loop controls autoplay  crossorigin="anonymous"></video>\n\t<div id="three"></div>\n\t<div class="ThreeFonts"></div>\n</div>\n';

}
return __p
}};