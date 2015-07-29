var Simple1DNoise = (function(numPoints) {
    var PERLIN_AMP = 1;
    var PERLIN_SCALE = 1;
    var MAX_VERTICES = numPoints || NUM_POINTS;
    var MAX_VERTICES_MASK = MAX_VERTICES - 1;
    var mirror = 0;

    var lerp = function(a, b, t) {
        return a * (1 - t) + b * t;
    };

    var cosLerp = function(a, b, x) {
        var ft = x * 3.1415927
        var f = (1 - Math.cos(ft)) * .5
        return a * (1 - f) + b * f
    };
    var r = [];
    for (var i = 0; i < MAX_VERTICES; ++i) {
        r.push(Math.random());
    }
    var l = r.length;
    /*for (var i = 0; i < 10; i++) {
		r[l-i] = r[i];
	}*/
    r[0] = cosLerp(r[l - 1], r[1], 0.5);

    var getVal = function(x) {
        var scaledX = x * PERLIN_SCALE;
        var xFloor = Math.floor(scaledX);
        var t = scaledX - xFloor;
        var tRemapSmoothstep = t * t * (3 - 2 * t);

        /// Modulo using &
        var xMin = xFloor % MAX_VERTICES_MASK;
        var xMax = (xMin + 1) % MAX_VERTICES_MASK;

        var y = cosLerp(r[xMin], r[xMax], tRemapSmoothstep);

        return y * PERLIN_AMP;
    };

    // return the API
    return {
        getVal: getVal,
        setAmplitude: function(newAmplitude) {
            amplitude = newAmplitude;
        },
        setScale: function(newScale) {
            scale = newScale;
        }
    };
})(100);

module.exports = Simple1DNoise;