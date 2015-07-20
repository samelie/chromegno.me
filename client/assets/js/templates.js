this.JST = {"app": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="App">\n\t<button class="btn btn-default js-shader">Shader</button>\n\t<button class="btn btn-default js-composer">Composer</button>\n\t<div id="#content"></div>\n</div>';

}
return __p
},
"composer_view": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="ThreeView">\n\t<video id="myVideo" src="../vid1.mp4" loop controls autoplay ></video>\n\t<video id="myVideo2" src="../vid2.mp4" loop controls autoplay ></video>\n\t<video id="mixer" src="../mixer.mp4" loop controls autoplay ></video>\n\t<div id="three"></div>\n</div>';

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
__p += '<div class="YoutubeMix">\n\t<video id="myVideo" controls autoplay ></video>\n\t<input id="searchField" class="YoutubeKeywords" type="text" value="comma seperated search terms">\n\t<div class="YoutubeButton js-go">GO</div>\n</div>';

}
return __p
},
"youtube_player": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="YoutubePlayer">\n\t<video id="myVideo" controls autoplay ></video>\n</div>';

}
return __p
},
"youtube_three": function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="YoutubeThree">\n\t<video id="myVideo" src="../vid.mp4" loop controls autoplay ></video>\n\t<video id="myVideo2" src="../vid2.mp4" loop controls autoplay ></video>\n\t<div id="three"></div>\n\t<div class="ThreeFonts"></div>\n</div>';

}
return __p
}};