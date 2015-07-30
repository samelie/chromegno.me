uniform sampler2D tDiffuse;
uniform float radius;
uniform float angle;

varying vec2 vUv;

void main(void) {
  vec2 coord = vUv - 0.5;
  float dist = length(coord);

       float ratio = (radius - dist) / radius;
       float angleMod = ratio * ratio * angle;
       float s = sin(angleMod);
       float c = cos(angleMod);
       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);

  gl_FragColor = texture2D(tDiffuse, coord+0.5);
}