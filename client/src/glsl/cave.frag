            varying vec3 vTangent;
            varying vec3 vBinormal;
            varying vec3 vNormal;
            varying vec2 vUv;

            varying vec3 vWorldPosition;
            varying vec3 vViewPosition;

            uniform vec3 uAmbientColor;
            uniform vec3 uDiffuseColor;
            uniform vec3 uSpecularColor;

            uniform float uTime;
            uniform float uWidth;
            uniform float uHeight;
            uniform float uRes;

            uniform sampler2D tOne;
            uniform sampler2D tTwo;
            uniform sampler2D tDisplacement;


            void main() {
                vec3 iResolution = vec3(1., 1.,1. );
                //normalize stuff
               /* vec2 uv = iResolution.xy;
                uv.x = uv.x / uWidth;
                uv.y = uv.y / uHeight;
*/

                vec4 p = vec4(vUv, 1, 1) / iResolution.xyzz - .5, d = p * .1, t;
                p.w += uTime * 1.;
                d.y += sin(p.w) * .001;
                d.y = -abs(d.y);

                for (float i = 10.; i > 0.; i -= .005) {
                    p += d;
                    t = texture2D(tOne, .2 + p.xw / 2e2, -99.);
                    t *= texture2D(tTwo, .2 + p.xw / 3e2, -99.);
                    gl_FragColor = t * i;

                    if (t.y * 13. > p.y + 6.) break;
                }
                //gl_FragColor = vec4(texelColor.rgb, 1.0);
                //gl_FragColor = vec4(c,c,c, 1.0);
            }
