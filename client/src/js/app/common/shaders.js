var glslify = require('glslify');
THREE.CopyShader = require('./shaders/CopyShader');
THREE.MaskPass = require('./post/MaskPass');
THREE.RenderPass = require('./post/RenderPass');
THREE.ShaderPass = require('./post/ShaderPass');
require('./post/EffectComposer');
/*var source = glslify({
    vertex: '../../../glsl/displacement.vert',
    fragment: '../../../glsl/mega.frag',
    sourceOnly: true
});*/

/*var createShader = require('three-glslify')(THREE)
var myShader = createShader(source);
console.log(myShader);*/

module.exports = {
    'mix' : {
        uniforms: THREE.UniformsUtils.merge( [
             THREE.UniformsLib[ "fog" ],
            THREE.UniformsLib[ "lights" ],
            THREE.UniformsLib[ "shadowmap" ],

            {

            "uMixRatio"   : { type: "f", value: 0.5 },
            "uThreshold"   : { type: "f", value: 0.5 },
            "uSaturation"   : { type: "f", value: 1. },

            "tDiffuse"     : { type: "t", value: null },
            "tDisplacement"     : { type: "t", value: null },
            "tTwo"     : { type: "t", value: null },
            "tMix"     : { type: "t", value: null },

            "enableAO"        : { type: "i", value: 0 },
            "enableDiffuse"   : { type: "i", value: 0 },
            "enableSpecular"  : { type: "i", value: 0 },
            "enableReflection": { type: "i", value: 0 },
            "enableDisplacement": { type: "i", value: 0 },
            "enableAberation": { type: "i", value: 0 },
            "enableColor": { type: "i", value: 0 },

            "tDisplacement": { type: "t", value: null }, // must go first as this is vertex texture
            "tCube"        : { type: "t", value: null },
            "tNormal"      : { type: "t", value: null },
            "tSpecular"    : { type: "t", value: null },
            "tAO"          : { type: "t", value: null },

            "uNormalScale": { type: "v2", value: new THREE.Vector2( 1, 1 ) },

            "uDisplacementBias": { type: "f", value: 0.0 },
            "uDisplacementScale": { type: "f", value: 100.0 },

            "uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
            "uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
            "uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
            "uShininess": { type: "f", value: 30 },
            "uOpacity": { type: "f", value: 1 },

            //color
            "uSaturation": { type: "f", value: 1 },
            "uContrast": { type: "f", value: 1 },
            "uDesaturate": { type: "f", value: 0 },
            "uBrightness": { type: "f", value: 0 },
            "uHue": { type: "f", value: 0 },

            "uTime": { type: "f", value: 1 },

            "useRefract": { type: "i", value: 0 },
            "uRefractionRatio": { type: "f", value: 0.98 },
            "uReflectivity": { type: "f", value: 0.5 },

            "uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
            "uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

            "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

            }

            ] ),
            
            fragmentShader:glslify('../../../glsl/mix.frag'),
            vertexShader:glslify('../../../glsl/basic.vert')
    },
    'mega' : {
        uniforms: THREE.UniformsUtils.merge( [

            THREE.UniformsLib[ "fog" ],
            THREE.UniformsLib[ "lights" ],
            THREE.UniformsLib[ "shadowmap" ],

            {

            "enableAO"        : { type: "i", value: 0 },
            "enableDiffuse"   : { type: "i", value: 0 },
            "enableSpecular"  : { type: "i", value: 0 },
            "enableReflection": { type: "i", value: 0 },
            "enableDisplacement": { type: "i", value: 0 },
            "enableAberation": { type: "i", value: 0 },
            "enableColor": { type: "i", value: 0 },

            "tDisplacement": { type: "t", value: null }, // must go first as this is vertex texture
            "tDiffuse"     : { type: "t", value: null },
            "tCube"        : { type: "t", value: null },
            "tNormal"      : { type: "t", value: null },
            "tSpecular"    : { type: "t", value: null },
            "tAO"          : { type: "t", value: null },

            "uNormalScale": { type: "v2", value: new THREE.Vector2( 1, 1 ) },

            "uDisplacementBias": { type: "f", value: 0.0 },
            "uDisplacementScale": { type: "f", value: 1.0 },

            "uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
            "uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
            "uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
            "uShininess": { type: "f", value: 30 },
            "uOpacity": { type: "f", value: 1 },

            //color
            "uSaturation": { type: "f", value: 1 },
            "uContrast": { type: "f", value: 1 },
            "uDesaturate": { type: "f", value: 0 },
            "uBrightness": { type: "f", value: 0 },
            "uHue": { type: "f", value: 0 },

            "uTime": { type: "f", value: 1 },

            "useRefract": { type: "i", value: 0 },
            "uRefractionRatio": { type: "f", value: 0.98 },
            "uReflectivity": { type: "f", value: 0.5 },

            "uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
            "uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

            "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

            }

        ] ),
        
        fragmentShader:glslify('../../../glsl/mega.frag'),
        vertexShader:glslify('../../../glsl/displacement.vert')
    },
    'color' : {
        uniforms: THREE.UniformsUtils.merge( [


            {

            "tDiffuse"     : { type: "t", value: null },

            //color
            "uSaturation": { type: "f", value: 1 },
            "uContrast": { type: "f", value: 0 },
            "uDesaturate": { type: "f", value: 0 },
            "uBrightness": { type: "f", value: 0 },
            "uHue": { type: "f", value: 0 }
            }

            ] ),
            
            fragmentShader:glslify('../../../glsl/color.frag'),
            vertexShader:glslify('../../../glsl/basic.vert')
        },
         'displace' : {
        uniforms: THREE.UniformsUtils.merge( [

            THREE.UniformsLib[ "fog" ],
            THREE.UniformsLib[ "lights" ],
            THREE.UniformsLib[ "shadowmap" ],

            {

            "enableChroma"   : { type: "i", value: 0 },
            "enableDisplacement"   : { type: "i", value: 0 },
            "enableReflection": { type: "i", value: 0 },
            "enableRipples": { type: "i", value: 0 },
            "enableColor": { type: "i", value: 0 },

            "tOne"     : { type: "t", value: null },
            "tTwo"     : { type: "t", value: null },
            "tDisplacement"     : { type: "t", value: null },

            "uNormalScale": { type: "v2", value: new THREE.Vector2( 1, 1 ) },

            "uDisplacementBias": { type: "f", value: 0.0 },
            "uDisplacementScale": { type: "f", value: 1.0 },

            "uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
            "uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
            "uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
            "uShininess": { type: "f", value: 30 },
            "uOpacity": { type: "f", value: 1 },

            //color
            "uSaturation": { type: "f", value: 1 },
            "uContrast": { type: "f", value: 0 },
            "uDesaturate": { type: "f", value: 0 },
            "uBrightness": { type: "f", value: 0 },
            "uHue": { type: "f", value: 0 },

            "uTime": { type: "f", value: 1 },
            "uWidth": { type: "f", value: 1 },
            "uHeight": { type: "f", value: 1 },
            "uRes": { type: "f", value: 1 },

            "useRefract": { type: "i", value: 0 },
            "uRefractionRatio": { type: "f", value: 0.98 },
            "uReflectivity": { type: "f", value: 0.5 },

            "uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
            "uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

            "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

            }

            ] ),
            
            fragmentShader:glslify('../../../glsl/chroma.frag'),
            vertexShader:glslify('../../../glsl/displacement.vert')
        },
    'chroma' : {
        uniforms: THREE.UniformsUtils.merge( [

            THREE.UniformsLib[ "fog" ],
            THREE.UniformsLib[ "lights" ],
            THREE.UniformsLib[ "shadowmap" ],

            {

            "enableChroma"   : { type: "i", value: 0 },
            "enableDisplacement"   : { type: "i", value: 0 },
            "enableReflection": { type: "i", value: 0 },
            "enableRipples": { type: "i", value: 0 },
            "enableColor": { type: "i", value: 0 },

            "tOne"     : { type: "t", value: null },
            "tTwo"     : { type: "t", value: null },
            "tDisplacement"     : { type: "t", value: null },

            "uNormalScale": { type: "v2", value: new THREE.Vector2( 1, 1 ) },

            "uDisplacementBias": { type: "f", value: 0.0 },
            "uDisplacementScale": { type: "f", value: 1.0 },

            "uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
            "uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
            "uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
            "uShininess": { type: "f", value: 30 },
            "uOpacity": { type: "f", value: 1 },

            //color
            "uSaturation": { type: "f", value: 1 },
            "uContrast": { type: "f", value: 0 },
            "uDesaturate": { type: "f", value: 0 },
            "uBrightness": { type: "f", value: 0 },
            "uHue": { type: "f", value: 0 },

            "uTime": { type: "f", value: 1 },
            "uWidth": { type: "f", value: 1 },
            "uHeight": { type: "f", value: 1 },
            "uRes": { type: "f", value: 1 },

            "useRefract": { type: "i", value: 0 },
            "uRefractionRatio": { type: "f", value: 0.98 },
            "uReflectivity": { type: "f", value: 0.5 },

            "uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
            "uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

            "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

            }

            ] ),
            
            fragmentShader:glslify('../../../glsl/chroma.frag'),
            vertexShader:glslify('../../../glsl/displacement.vert')
        },
        'fractal1' : {
            uniforms: THREE.UniformsUtils.merge( [
                 THREE.UniformsLib[ "fog" ],
                    THREE.UniformsLib[ "lights" ],
                    THREE.UniformsLib[ "shadowmap" ],

                {
                "tOne"     : { type: "t", value: null },
                "tTwo"     : { type: "t", value: null },
                "tDisplacement"     : { type: "t", value: null },

                "uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
                "uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
                "uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },

                "uTime": { type: "f", value: 1 },
                "uWidth": { type: "f", value: 1 },
                "uHeight": { type: "f", value: 1 },
                "uRes": { type: "f", value: 1 },
                "uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
                "uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) }

                }

                ] ),
                
                fragmentShader:glslify('../../../glsl/fractal1.frag'),
                vertexShader:glslify('../../../glsl/displacement.vert')
            },
            'cave' : {
                uniforms: THREE.UniformsUtils.merge( [
                     THREE.UniformsLib[ "fog" ],
                        THREE.UniformsLib[ "lights" ],
                        THREE.UniformsLib[ "shadowmap" ],

                    {
                    "tOne"     : { type: "t", value: null },
                    "tTwo"     : { type: "t", value: null },
                    "tDisplacement"     : { type: "t", value: null },

                    "uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
                    "uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
                    "uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },

                    "uTime": { type: "f", value: 1 },
                    "uWidth": { type: "f", value: 1 },
                    "uHeight": { type: "f", value: 1 },
                    "uRes": { type: "f", value: 1 },
                    "uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
                    "uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) }

                    }

                    ] ),
                    
                    fragmentShader:glslify('../../../glsl/cave.frag'),
                    vertexShader:glslify('../../../glsl/displacement.vert')
                },
                'twist' : {
                uniforms: THREE.UniformsUtils.merge( [

                        {
                        "tDiffuse": { type: "t", value: null },
                        "radius":    { type: "f", value: Math.PI },
                        "angle":    { type: "f", value: 1.0 }
                        }

                    ] ),
                    
                    fragmentShader:glslify('../../../glsl/twist.frag'),
                    vertexShader:glslify('../../../glsl/basic.vert')
                },
                 'creepy' : {
                uniforms: THREE.UniformsUtils.merge( [

                        {
                        "tDiffuse": { type: "t", value: null },
                        "amount":    { type: "f", value: 0.02 }
                        }

                    ] ),
                    
                    fragmentShader:glslify('../../../glsl/creepy.frag'),
                    vertexShader:glslify('../../../glsl/basic.vert')
                },
                'distort' : {
                uniforms: THREE.UniformsUtils.merge( [

                        {
                        "tDiffuse": { type: "t", value: null },
                        "tDisplacement": { type: "t", value: null },
                        "amount":    { type: "f", value: 0.2 }
                        }

                    ] ),
                    
                    fragmentShader:glslify('../../../glsl/distort.frag'),
                    vertexShader:glslify('../../../glsl/basic.vert')
                },
                 'rgbShift' : {
                uniforms: THREE.UniformsUtils.merge( [

                        {
                        "tDiffuse": { type: "t", value: null },
                        "tSize"    : { type: "v2", value: new THREE.Vector2( 32, 32 ) },
                        "amount":    { type: "f", value: 0.01 },
                        "uRedX":    { type: "i", value: 1 },
                        "uRedY":    { type: "i", value: 1 },
                        "uGreenX":    { type: "i", value: 1 },
                        "uGreenY":    { type: "i", value: 1 },
                        "uBlueX":    { type: "i", value: 1 },
                        "uBlueY":    { type: "i", value: 1 }
                        }

                    ] ),
                    
                    fragmentShader:glslify('../../../glsl/rgbShift.frag'),
                    vertexShader:glslify('../../../glsl/basic.vert')
                },
                'glitch':{
                        uniforms:  THREE.UniformsUtils.merge( [

                        {
                        "tDiffuse": { type: "t", value: null },
                        "tGlitch": { type: "t", value: THREE.ImageUtils.loadTexture('assets/img/glitch.png') },
                        "amount":    { type: "f", value: 0.01 },
                        "uTime":    { type: "f", value: 1.0 }
                        }

                    ] ),
                    
                    fragmentShader:glslify('../../../glsl/glitch.frag'),
                    vertexShader:glslify('../../../glsl/basic.vert')
                },
                bleach:require('./shaders/BleachBypassShader'),
                bit:require('./shaders/BitShader'),
                pixelate:require('./shaders/PixelateShader'),
                blend:require('./shaders/BlendShader'),
                brightness:require('./shaders/BrightnessContrastShader'),
                colorify:require('./shaders/ColorifyShader'),
                hue:require('./shaders/HueSaturationShader'),
                displacement:require('./shaders/NormalDisplacementShader'),
                technicolor:require('./shaders/TechnicolorShader'),
                tone:require('./shaders/ToneMapShader'),
                bokah:require('./shaders/BokehShader2'), //bad
                convolution:require('./shaders/ConvolutionShader'),
                edge:require('./shaders/EdgeShader2'),
                film:require('./shaders/FilmShader'),
                focus:require('./shaders/FocusShader'),
                fxxa:require('./shaders/FXAAShader'),
                hBlur:require('./shaders/HorizontalBlurShader'),
                vBlur:require('./shaders/VerticalBlurShader'),
                kaleido:require('./shaders/KaleidoShader'),
                mirror:require('./shaders/MirrorShader'),
                rgb:require('./shaders/RGBShiftShader'),
                sepia:require('./shaders/SepiaShader'),
                //glitch:require('./shaders/DigitalGlitch'),
                dot:require('./shaders/DotScreenShader'),
                copy:THREE.CopyShader
    };