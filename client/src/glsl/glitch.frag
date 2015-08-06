uniform sampler2D tDiffuse;
uniform sampler2D tGlitch;
uniform float amount;
uniform float uTime;

varying vec2 vUv;

void main(void) {
	vec2 block = floor(gl_FragCoord.xy / vec2(16));
	vec2 uv_noise = block / vec2(64);
	uv_noise += floor(vec2(uTime) * vec2(1234.0, 3543.0)) / vec2(64);
	
	float block_thresh = pow(fract(uTime * 1236.0453), 2.0) * 0.2;
	float line_thresh = pow(fract(uTime * 2236.0453), 3.0) * 0.7;
	
	vec2 uv_r = vUv, uv_g = vUv, uv_b = vUv;

	// glitch some blocks and lines
	if (texture2D(tGlitch, uv_noise).r < block_thresh ||
		texture2D(tGlitch, vec2(uv_noise.y, 0.0)).g < line_thresh) {

		vec2 dist = (fract(uv_noise) - 0.5) * 0.3;
		uv_r += dist * 0.1;
		uv_g += dist * 0.2;
		uv_b += dist * 0.125;
	}

	gl_FragColor.r = texture2D(tDiffuse, uv_r).r;
	gl_FragColor.g = texture2D(tDiffuse, uv_g).g;
	gl_FragColor.b = texture2D(tDiffuse, uv_b).b;

	// loose luma for some blocks
	if (texture2D(tGlitch, uv_noise).g < block_thresh)
		gl_FragColor.rgb = gl_FragColor.ggg;

	// discolor block lines
	if (texture2D(tGlitch, vec2(uv_noise.y, 0.0)).b * 3.5 < line_thresh)
		gl_FragColor.rgb = vec3(0.0, dot(gl_FragColor.rgb, vec3(1.0)), 0.0);

	// interleave lines in some blocks
	if (texture2D(tGlitch, uv_noise).g * 1.5 < block_thresh ||
		texture2D(tGlitch, vec2(uv_noise.y, 0.0)).g * 2.5 < line_thresh) {
		float line = fract(gl_FragCoord.y / 3.0);
		vec3 mask = vec3(3.0, 0.0, 0.0);
		if (line > 0.333)
			mask = vec3(0.0, 3.0, 0.0);
		if (line > 0.666)
			mask = vec3(0.0, 0.0, 3.0);
		
		gl_FragColor.xyz *= mask;
	}
}


