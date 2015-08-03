uniform sampler2D tDiffuse;
uniform sampler2D tDispacement;
uniform float amount;

varying vec2 vUv;

void main(void) {
    vec4 disp = texture2D(tDispacement, vUv) - vec4(0.5,0.5,0.5,0.0);
    vec2 n_uv = vUv;
    n_uv += amount*disp.xy*disp.z;
	n_uv.y *= -1.0;
	gl_FragColor = texture2D(tDiffuse, n_uv);
}
