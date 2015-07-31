varying vec2 vTextureCoord;

uniform sampler2D tDiffuse;
uniform vec2 tSize;
uniform float amount;
uniform int uRedX;
uniform int uRedY;
uniform int uGreenX;
uniform int uGreenY;
uniform int uBlueX;
uniform int uBlueY;

varying vec2 vUv;

void main(void) {
	vec2 r = vec2(uRedX, uRedY) * amount;
	vec2 g = vec2(uGreenX, uGreenY) * amount;
	vec2 b = vec2(uBlueX, uBlueY) * amount;
	vec2 ttSize = tSize * amount;
	r /= ttSize.xy;
	r.x = cos(r.x);
	r.y = sin(r.y);
	g /= ttSize.xy;
	g.x = cos(g.x);
	g.y = sin(g.y);
	b /= ttSize.xy;
	b.x = cos(b.x);
	b.y = sin(b.y);
	gl_FragColor.r = texture2D(tDiffuse, (vUv + r) * .5).r;
	gl_FragColor.g = texture2D(tDiffuse, (vUv + g) * .5).g;
	gl_FragColor.b = texture2D(tDiffuse, (vUv + b) * .5).b;
	gl_FragColor.a = 1.0;
}