/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Sobel filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

module.exports = {

	uniforms: {

		"tDiffuse": {
			type: "t",
			value: null
		},
		"xAmount": {
			type: "f",
			value: 0.01
		},
		"yAmount": {
			type: "f",
			value: 0.01
		},
		"tSize":    { type: "v2", value: new THREE.Vector2( 64, 64 ) }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",
		"uniform float xAmount;",
		"uniform float yAmount;",
		"uniform vec2 tSize;",


		"void main(void)",
		"{",
			"vec2 s = vec2(xAmount,yAmount);",
			"vec2 size = tSize / s;",
			 "vec2 color = floor( ( vUv * size ) ) / size + s/tSize * 0.5;",
			"gl_FragColor = texture2D(tDiffuse, color);",
		"} ",

	].join("\n")

};