var glslify = require('glslify');
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

            {

            "uMixRatio"   : { type: "f", value: 0.5 },
            "uThreshold"   : { type: "f", value: 0.5 },
            "uSaturation"   : { type: "f", value: 1. },

            "tOne"     : { type: "t", value: null },
            "tTwo"     : { type: "t", value: null },
            "tMix"     : { type: "t", value: null },

            }

            ] ),
            
            fragmentShader:glslify('../../../glsl/mix.frag'),
            vertexShader:glslify('../../../glsl/basic.vert')
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
                }
    };