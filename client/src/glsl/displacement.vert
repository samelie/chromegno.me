            attribute vec4 tangent;

            uniform vec2 uOffset;
            uniform vec2 uRepeat;

            uniform bool enableDisplacement;

            #ifdef VERTEX_TEXTURES

                uniform sampler2D tDisplacement;
                uniform float uDisplacementScale;
                uniform float uDisplacementBias;

            #endif

            varying vec3 vTangent;
            varying vec3 vBinormal;
            varying vec3 vNormal;
            varying vec2 vUv;

            varying vec3 vWorldPosition;
            varying vec3 vViewPosition;

            #ifdef USE_SKINNING

                #ifdef BONE_TEXTURE

                    uniform sampler2D boneTexture;

                    mat4 getBoneMatrix( const in float i ) {

                        float j = i * 4.0;
                        float x = mod( j, N_BONE_PIXEL_X );
                        float y = floor( j / N_BONE_PIXEL_X );

                        const float dx = 1.0 / N_BONE_PIXEL_X;
                        const float dy = 1.0 / N_BONE_PIXEL_Y;

                        y = dy * ( y + 0.5 );

                        vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
                        vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
                        vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
                        vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );

                        mat4 bone = mat4( v1, v2, v3, v4 );

                        return bone;

                    }

                #else

                    uniform mat4 boneGlobalMatrices[ MAX_BONES ];

                    mat4 getBoneMatrix( const in float i ) {

                        mat4 bone = boneGlobalMatrices[ int(i) ];
                        return bone;

                    }

                #endif

            #endif
            
            #ifdef USE_SHADOWMAP

                varying vec4 vShadowCoord[ MAX_SHADOWS ];
                uniform mat4 shadowMatrix[ MAX_SHADOWS ];

            #endif

            void main() {


                vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );

                vUv = uv * uRepeat + uOffset;

                // displacement mapping

                vec3 displacedPosition;

                #ifdef VERTEX_TEXTURES

                    if ( enableDisplacement ) {

                        vec3 dv = texture2D( tDisplacement, uv ).xyz;
                        float df = uDisplacementScale * dv.x + uDisplacementBias;
                        displacedPosition = position + normalize( normal ) * df;

                    } else {

                        #ifdef USE_SKINNING

                            vec4 skinVertex = vec4( position, 1.0 );

                            vec4 skinned  = boneMatX * skinVertex * skinWeight.x;
                            skinned      += boneMatY * skinVertex * skinWeight.y;

                            displacedPosition  = skinned.xyz;

                        #else

                            displacedPosition = position;

                        #endif

                    }

                #else

                    #ifdef USE_SKINNING

                        vec4 skinVertex = vec4( position, 1.0 );

                        vec4 skinned  = boneMatX * skinVertex * skinWeight.x;
                        skinned      += boneMatY * skinVertex * skinWeight.y;

                        displacedPosition  = skinned.xyz;

                    #else

                        displacedPosition = position;

                    #endif

                #endif

                //

                vec4 mvPosition = modelViewMatrix * vec4( displacedPosition, 1.0 );
                vec4 worldPosition = modelMatrix * vec4( displacedPosition, 1.0 );

                gl_Position = projectionMatrix * mvPosition;

                //

                vWorldPosition = worldPosition.xyz;
                vViewPosition = -mvPosition.xyz;

                // shadows

                #ifdef USE_SHADOWMAP

                    for( int i = 0; i < MAX_SHADOWS; i ++ ) {

                        vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;

                    }

                #endif

            }