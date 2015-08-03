uniform sampler2D tDiffuse;
uniform float amount;

varying vec2 vUv;

void main(void) {
  gl_FragColor = texture2D(tDiffuse, vUv+(texture2D(tDiffuse, vUv).rb-vec2(.5))*amount);
}
