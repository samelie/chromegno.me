varying vec2 vTextureCoord;

uniform sampler2D tDiffuse;
uniform vec2 tSize;
uniform int uRed;
uniform int uGreen;
uniform int uBlue;

varying vec2 vUv;

void main(void) {
	gl_FragColor.r = texture2D(tDiffuse, vUv + vec2(uRed, uRed) / tSize.xy).r;
	gl_FragColor.g = texture2D(tDiffuse, vUv + vec2(uGreen, uGreen) / tSize.xy).g;
	gl_FragColor.b = texture2D(tDiffuse, vUv + vec2(uBlue, uBlue) / tSize.xy).b;
	gl_FragColor.a = 1.0;
}