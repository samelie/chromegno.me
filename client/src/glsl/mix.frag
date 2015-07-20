            varying vec2 vUv;

            uniform float uThreshold;
            uniform float uMixRatio;
            uniform float uSaturation;

            uniform sampler2D tOne;
            uniform sampler2D tTwo;
            uniform sampler2D tMix;

            vec3 changeSaturation(vec3 color, float saturation) {
                float luma = dot(vec3(0.2125, 0.7154, 0.0721) * color, vec3(1.));
                return mix(vec3(luma), color, saturation);
            }

            void main() {
                vec4 texOne = texture2D(tOne, vUv);
                vec4 texTwo = texture2D(tTwo, vUv);
                vec4 texMix = texture2D(tMix, vUv);

                vec3 textTwoCol = texTwo.rgb;
                textTwoCol = changeSaturation(textTwoCol, uSaturation);

                vec4 transitionTexel = texture2D(tMix, vUv);
                float r = uMixRatio * (1.0 + uThreshold * 2.0) - uThreshold;
                float mixf = clamp((transitionTexel.g - r) * (1.0 / uThreshold), 0.0, 1.0);
                vec4 col = mix(texOne, vec4(textTwoCol, 1.0), mixf);
                col *= 0.01 + 2.5 * pow(vUv.x * vUv.y * (1.0 - vUv.x) * (1.0 - vUv.y), 0.3);
                gl_FragColor = col;
                // gl_FragColor = texOne;
            }