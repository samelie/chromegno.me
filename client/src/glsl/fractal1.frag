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

             //Basic fractal by @paulofalcao

            const int maxIterations = 4; //a nice value for fullscreen is 8

            float circleSize = 1.0 / (0.4 * pow(2.0, float(maxIterations)));

             //generic rotation formula
            vec2 rot(vec2 uv, float a) {
                return vec2(uv.x * cos(a) - uv.y * sin(a), uv.y * cos(a) + uv.x * sin(a));
            }

            void main() {
                vec2 iResolution = vec2(uWidth, uHeight);
                //normalize stuff
                vec2 uv = iResolution.xy;
                uv.x = uv.x / uWidth;
                uv.y = uv.y / uHeight;
                uv = -.5 * (uv - 2.0 * vUv.xy) / uv.x;
                //global rotation and zoom
                uv = rot(uv, uTime);
                uv *= sin(uTime) * 0.05 + 4.;

                //mirror, rotate and scale 6 times...
                float s = 1.;
                for (int i = 0; i < maxIterations; i++) {
                    uv = abs(uv) - s;
                    uv = rot(uv, uTime);
                    s = s / 2.1;
                }

                //draw a circle
                //float c = length(uv) > circleSize ? 0.0 : 1.0;*/

                vec4 texelColor = texture2D(tOne,  uv );
                gl_FragColor = vec4(texelColor.rgb, 1.0);
                //gl_FragColor = vec4(c,c,c, 1.0);
            }