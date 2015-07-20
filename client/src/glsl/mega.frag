            vec3 toHue(vec3 rgb, float adjustment)
            {
                const mat3 toYIQ = mat3(0.299,     0.587,     0.114,
                                        0.595716, -0.274453, -0.321263,
                                        0.211456, -0.522591,  0.311135);
                const mat3 toRGB = mat3(1.0,  0.9563,  0.6210,
                                        1.0, -0.2721, -0.6474,
                                        1.0, -1.107,   1.7046);
                
                vec3 yiq = toYIQ * rgb;
                float hue = atan(yiq.z, yiq.y) + adjustment;
                float chroma = sqrt(yiq.z * yiq.z + yiq.y * yiq.y);
                
                vec3 color = vec3(yiq.x, chroma * cos(hue), chroma * sin(hue));
                return toRGB * color;
            }

            vec3 RGBToHSL(vec3 color)
            {
                vec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)
                
                float fmin = min(min(color.r, color.g), color.b);    //Min. value of RGB
                float fmax = max(max(color.r, color.g), color.b);    //Max. value of RGB
                float delta = fmax - fmin;             //Delta RGB value
            
                hsl.z = (fmax + fmin) / 2.0; // Luminance
            
                if (delta == 0.0)       //This is a gray, no chroma...
                {
                    hsl.x = 0.0;    // Hue
                    hsl.y = 0.0;    // Saturation
                }
                else                                    //Chromatic data...
                {
                    if (hsl.z < 0.5)
                        hsl.y = delta / (fmax + fmin); // Saturation
                    else
                        hsl.y = delta / (2.0 - fmax - fmin); // Saturation
                    
                    float deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;
                    float deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;
                    float deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;
            
                    if (color.r == fmax )
                        hsl.x = deltaB - deltaG; // Hue
                    else if (color.g == fmax)
                        hsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue
                    else if (color.b == fmax)
                        hsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue
            
                    if (hsl.x < 0.0)
                        hsl.x += 1.0; // Hue
                    else if (hsl.x > 1.0)
                        hsl.x -= 1.0; // Hue
                }
            
                return hsl;
            }

            vec3 rgb2hsv(vec3 rgb)
            {
                float Cmax = max(rgb.r, max(rgb.g, rgb.b));
                float Cmin = min(rgb.r, min(rgb.g, rgb.b));
                float delta = Cmax - Cmin;

                vec3 hsv = vec3(0., 0., Cmax);
                
                if (Cmax > Cmin)
                {
                    hsv.y = delta / Cmax;

                    if (rgb.r == Cmax)
                        hsv.x = (rgb.g - rgb.b) / delta;
                    else
                    {
                        if (rgb.g == Cmax)
                            hsv.x = 2. + (rgb.b - rgb.r) / delta;
                        else
                            hsv.x = 4. + (rgb.r - rgb.g) / delta;
                    }
                    hsv.x = fract(hsv.x / 6.);
                }
                return hsv;
            }

            float chromaVal(vec3 color, vec3 keyColor, float tolerance, float slope)
            {
                float d = abs(length(abs(keyColor - color)));
                float edge0 = tolerance * (1.0 - slope);
                float alpha = smoothstep(edge0, tolerance, d);
                return 1. - alpha;
            }
            
            

            vec3 changeSaturation(vec3 color, float saturation)
            {
                float luma = dot(vec3(0.2125, 0.7154, 0.0721) * color, vec3(1.));
                return mix(vec3(luma), color, saturation);
            }
            
            vec3 Desaturate(vec3 color, float Desaturation)
            {
                vec3 grayXfer = vec3(0.3, 0.59, 0.11);
                vec3 gray = vec3(dot(grayXfer, color));
                return vec3(mix(color, gray, Desaturation));
            }

            uniform vec3 uAmbientColor;
            uniform vec3 uDiffuseColor;
            uniform vec3 uSpecularColor;
            uniform float uShininess;
            uniform float uOpacity;

            uniform bool enableDiffuse;
            uniform bool enableSpecular;
            uniform bool enableAO;
            uniform bool enableAberation;
            uniform bool enableReflection;
            uniform bool enableColor;

            uniform sampler2D tDiffuse;
            uniform sampler2D tNormal;
            uniform sampler2D tSpecular;
            uniform sampler2D tAO;

            uniform samplerCube tCube;

            uniform vec2 uNormalScale;

            uniform bool useRefract;
            uniform float uRefractionRatio;
            uniform float uReflectivity;

            uniform float uTime;

            varying vec3 vTangent;
            varying vec3 vBinormal;
            varying vec3 vNormal;
            varying vec2 vUv;

            //color
            uniform float uSaturation;
            uniform float uContrast;
            uniform float uDesaturate;
            uniform float uBrightness;
            uniform float uHue;

            uniform vec3 ambientLightColor;

            #if MAX_DIR_LIGHTS > 0

                uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
                uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];

            #endif

            #if MAX_HEMI_LIGHTS > 0

                uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
                uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
                uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];

            #endif

            #if MAX_POINT_LIGHTS > 0

                uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];
                uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
                uniform float pointLightDistance[ MAX_POINT_LIGHTS ];

            #endif

            #if MAX_SPOT_LIGHTS > 0

                uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
                uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
                uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
                uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
                uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
                uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];

            #endif

            #ifdef WRAP_AROUND

                uniform vec3 wrapRGB;

            #endif

            varying vec3 vWorldPosition;
            varying vec3 vViewPosition;

            #ifdef USE_SHADOWMAP

                uniform sampler2D shadowMap[ MAX_SHADOWS ];
                uniform vec2 shadowMapSize[ MAX_SHADOWS ];

                uniform float shadowDarkness[ MAX_SHADOWS ];
                uniform float shadowBias[ MAX_SHADOWS ];

                varying vec4 vShadowCoord[ MAX_SHADOWS ];

                float unpackDepth( const in vec4 rgba_depth ) {

                    const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
                    float depth = dot( rgba_depth, bit_shift );
                    return depth;

                }

            #endif
            #ifdef USE_FOG

                uniform vec3 fogColor;

                #ifdef FOG_EXP2

                    uniform float fogDensity;

                #else

                    uniform float fogNear;
                    uniform float fogFar;

                #endif

            #endif

            void main() {

                gl_FragColor = vec4( vec3( 1.0 ), uOpacity );

                vec3 specularTex = vec3( 1.0 );

                vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;
                normalTex.xy *= uNormalScale;
                normalTex = normalize( normalTex );



                if( enableDiffuse ) {

                    #ifdef GAMMA_INPUT

                        vec4 texelColor = texture2D( tDiffuse, vUv );
                        texelColor.xyz *= texelColor.xyz;

                        gl_FragColor = gl_FragColor * texelColor;

                        if ( enableAberation ) {
                            //SAM
                            float d = length(vUv - vec2(0.5,0.5));
                            float blur = 0.0;
                            blur = (1.0 + sin(uTime*100.)) * 0.5;
                            blur *= 1.0 + sin(uTime*100.) * 0.5;
                            blur = pow(blur, 2.0);
                            blur *= 0.05;
                            // reduce blur towards center
                            blur *= d;

                            vec3 col;
                            col.r = texture2D( tDiffuse, vec2(vUv.x+blur,vUv.y) ).r;
                            col.g = texture2D( tDiffuse, vUv ).g;
                            col.b = texture2D( tDiffuse, vec2(vUv.x-blur,vUv.y) ).b;

                            float scanline = sin(vUv.y*uTime)*0.1;
                            col -= scanline;

                            gl_FragColor = gl_FragColor * vec4(col,1.0);

                        }

                    #else

                        gl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );

                    #endif

                }

                if( enableColor ) {
                    vec3 color = gl_FragColor.rgb;    
                    color = changeSaturation(color, uSaturation);
                    color = Desaturate(color, uDesaturate);
                
                    color = (color - 0.5) *(uContrast + 1.0) + 0.5;  
                    color = color + uBrightness;   

                    color = toHue(color, uHue);   
                
                    gl_FragColor = vec4(color, 1.);
                }

                if( enableAO ) {

                    #ifdef GAMMA_INPUT

                        vec4 aoColor = texture2D( tAO, vUv );
                        aoColor.xyz *= aoColor.xyz;

                        gl_FragColor.xyz = gl_FragColor.xyz * aoColor.xyz;

                    #else

                        gl_FragColor.xyz = gl_FragColor.xyz * texture2D( tAO, vUv ).xyz;

                    #endif

                }

                if( enableSpecular )
                    specularTex = texture2D( tSpecular, vUv ).xyz;

                mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );
                vec3 finalNormal = tsb * normalTex;

                #ifdef FLIP_SIDED

                    finalNormal = -finalNormal;

                #endif

                vec3 normal = normalize( finalNormal );
                vec3 viewPosition = normalize( vViewPosition );

                // point lights

                #if MAX_POINT_LIGHTS > 0

                    vec3 pointDiffuse = vec3( 0.0 );
                    vec3 pointSpecular = vec3( 0.0 );

                    for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

                        vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
                        vec3 pointVector = lPosition.xyz + vViewPosition.xyz;

                        float pointDistance = 1.0;
                        if ( pointLightDistance[ i ] > 0.0 )
                            pointDistance = 1.0 - min( ( length( pointVector ) / pointLightDistance[ i ] ), 1.0 );

                        pointVector = normalize( pointVector );

                        // diffuse

                        #ifdef WRAP_AROUND

                            float pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );
                            float pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );

                            vec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );

                        #else

                            float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );

                        #endif

                        pointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;

                        // specular

                        vec3 pointHalfVector = normalize( pointVector + viewPosition );
                        float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );
                        float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );

                        #ifdef PHYSICALLY_BASED_SHADING

                            // 2.0 => 2.0001 is hack to work around ANGLE bug

                            float specularNormalization = ( uShininess + 2.0001 ) / 8.0;

                            vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );
                            pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;

                        #else

                            pointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;

                        #endif

                    }

                #endif

                // spot lights

                #if MAX_SPOT_LIGHTS > 0

                    vec3 spotDiffuse = vec3( 0.0 );
                    vec3 spotSpecular = vec3( 0.0 );

                    for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

                        vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );
                        vec3 spotVector = lPosition.xyz + vViewPosition.xyz;

                        float spotDistance = 1.0;
                        if ( spotLightDistance[ i ] > 0.0 )
                            spotDistance = 1.0 - min( ( length( spotVector ) / spotLightDistance[ i ] ), 1.0 );

                        spotVector = normalize( spotVector );

                        float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );

                        if ( spotEffect > spotLightAngleCos[ i ] ) {

                            spotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );

                            // diffuse

                            #ifdef WRAP_AROUND

                                float spotDiffuseWeightFull = max( dot( normal, spotVector ), 0.0 );
                                float spotDiffuseWeightHalf = max( 0.5 * dot( normal, spotVector ) + 0.5, 0.0 );

                                vec3 spotDiffuseWeight = mix( vec3 ( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );

                            #else

                                float spotDiffuseWeight = max( dot( normal, spotVector ), 0.0 );

                            #endif

                            spotDiffuse += spotDistance * spotLightColor[ i ] * uDiffuseColor * spotDiffuseWeight * spotEffect;

                            // specular

                            vec3 spotHalfVector = normalize( spotVector + viewPosition );
                            float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );
                            float spotSpecularWeight = specularTex.r * max( pow( spotDotNormalHalf, uShininess ), 0.0 );

                            #ifdef PHYSICALLY_BASED_SHADING

                                // 2.0 => 2.0001 is hack to work around ANGLE bug

                                float specularNormalization = ( uShininess + 2.0001 ) / 8.0;

                                vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( spotVector, spotHalfVector ), 5.0 );
                                spotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * spotDistance * specularNormalization * spotEffect;

                            #else

                                spotSpecular += spotDistance * spotLightColor[ i ] * uSpecularColor * spotSpecularWeight * spotDiffuseWeight * spotEffect;

                            #endif

                        }

                    }

                #endif

                // directional lights

                #if MAX_DIR_LIGHTS > 0

                    vec3 dirDiffuse = vec3( 0.0 );
                    vec3 dirSpecular = vec3( 0.0 );

                    for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {

                        vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
                        vec3 dirVector = normalize( lDirection.xyz );

                        // diffuse

                        #ifdef WRAP_AROUND

                            float directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );
                            float directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );

                            vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );

                        #else

                            float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );

                        #endif

                        dirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;

                        // specular

                        vec3 dirHalfVector = normalize( dirVector + viewPosition );
                        float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );
                        float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );

                        #ifdef PHYSICALLY_BASED_SHADING

                            // 2.0 => 2.0001 is hack to work around ANGLE bug

                            float specularNormalization = ( uShininess + 2.0001 ) / 8.0;

                            vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );
                            dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;

                        #else

                            dirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;

                        #endif

                    }

                #endif

                // hemisphere lights

                #if MAX_HEMI_LIGHTS > 0

                    vec3 hemiDiffuse  = vec3( 0.0 );
                    vec3 hemiSpecular = vec3( 0.0 ); ,

                    for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

                        vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
                        vec3 lVector = normalize( lDirection.xyz );

                        // diffuse

                        float dotProduct = dot( normal, lVector );
                        float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;

                        vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );

                        hemiDiffuse += uDiffuseColor * hemiColor;

                        // specular (sky light)


                        vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );
                        float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;
                        float hemiSpecularWeightSky = specularTex.r * max( pow( hemiDotNormalHalfSky, uShininess ), 0.0 );

                        // specular (ground light)

                        vec3 lVectorGround = -lVector;

                        vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );
                        float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;
                        float hemiSpecularWeightGround = specularTex.r * max( pow( hemiDotNormalHalfGround, uShininess ), 0.0 );

                        #ifdef PHYSICALLY_BASED_SHADING

                            float dotProductGround = dot( normal, lVectorGround );

                            // 2.0 => 2.0001 is hack to work around ANGLE bug

                            float specularNormalization = ( uShininess + 2.0001 ) / 8.0;

                            vec3 schlickSky = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( lVector, hemiHalfVectorSky ), 5.0 );
                            vec3 schlickGround = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 5.0 );
                            hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );

                        #else

                            hemiSpecular += uSpecularColor * hemiColor * ( hemiSpecularWeightSky + hemiSpecularWeightGround ) * hemiDiffuseWeight;

                        #endif

                    }

                #endif

                // all lights contribution summation

                vec3 totalDiffuse = vec3( 0.0 );
                vec3 totalSpecular = vec3( 0.0 );

                #if MAX_DIR_LIGHTS > 0

                    totalDiffuse += dirDiffuse;
                    totalSpecular += dirSpecular;

                #endif

                #if MAX_HEMI_LIGHTS > 0

                    totalDiffuse += hemiDiffuse;
                    totalSpecular += hemiSpecular;

                #endif

                #if MAX_POINT_LIGHTS > 0

                    totalDiffuse += pointDiffuse;
                    totalSpecular += pointSpecular;

                #endif

                #if MAX_SPOT_LIGHTS > 0

                    totalDiffuse += spotDiffuse;
                    totalSpecular += spotSpecular;

                #endif

                #ifdef METAL

                    gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor + totalSpecular );

                #else

                    gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor ) + totalSpecular;

                #endif

                if ( enableReflection ) {

                    vec3 vReflect;
                    vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );

                    if ( useRefract ) {

                        vReflect = refract( cameraToVertex, normal, uRefractionRatio );

                    } else {

                        vReflect = reflect( cameraToVertex, normal );

                    }

                    vec4 cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );

                    #ifdef GAMMA_INPUT

                        cubeColor.xyz *= cubeColor.xyz;

                    #endif

                    gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * uReflectivity );

                }

                #ifdef USE_SHADOWMAP

                    #ifdef SHADOWMAP_DEBUG

                        vec3 frustumColors[3];
                        frustumColors[0] = vec3( 1.0, 0.5, 0.0 );
                        frustumColors[1] = vec3( 0.0, 1.0, 0.8 );
                        frustumColors[2] = vec3( 0.0, 0.5, 1.0 );

                    #endif

                    #ifdef SHADOWMAP_CASCADE

                        int inFrustumCount = 0;

                    #endif

                    float fDepth;
                    vec3 shadowColor = vec3( 1.0 );

                    for( int i = 0; i < MAX_SHADOWS; i ++ ) {

                        vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;

                        // if ( something && something )       breaks ATI OpenGL shader compiler
                        // if ( all( something, something ) )  using this instead

                        bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
                        bool inFrustum = all( inFrustumVec );

                        // don't shadow pixels outside of light frustum
                        // use just first frustum (for cascades)
                        // don't shadow pixels behind far plane of light frustum

                        #ifdef SHADOWMAP_CASCADE

                            inFrustumCount += int( inFrustum );
                            bvec3 frustumTestVec = bvec3( inFrustum, inFrustumCount == 1, shadowCoord.z <= 1.0 );

                        #else

                            bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );

                        #endif

                        bool frustumTest = all( frustumTestVec );

                        if ( frustumTest ) {

                            shadowCoord.z += shadowBias[ i ];

                            #if defined( SHADOWMAP_TYPE_PCF )

                                // Percentage-close filtering
                                // (9 pixel kernel)
                                // http://fabiensanglard.net/shadowmappingPCF/

                                float shadow = 0.0;

                                /*
                                // nested loops breaks shader compiler / validator on some ATI cards when using OpenGL
                                // must enroll loop manually

                                for ( float y = -1.25; y <= 1.25; y += 1.25 )
                                    for ( float x = -1.25; x <= 1.25; x += 1.25 ) {

                                        vec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );

                                        // doesn't seem to produce any noticeable visual difference compared to simple texture2D lookup
                                        //vec4 rgbaDepth = texture2DProj( shadowMap[ i ], vec4( vShadowCoord[ i ].w * ( vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ), 0.05, vShadowCoord[ i ].w ) );

                                        float fDepth = unpackDepth( rgbaDepth );

                                        if ( fDepth < shadowCoord.z )
                                            shadow += 1.0;

                                }

                                shadow /= 9.0;

                                */

                                const float shadowDelta = 1.0 / 9.0;

                                float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
                                float yPixelOffset = 1.0 / shadowMapSize[ i ].y;

                                float dx0 = -1.25 * xPixelOffset;
                                float dy0 = -1.25 * yPixelOffset;
                                float dx1 = 1.25 * xPixelOffset;
                                float dy1 = 1.25 * yPixelOffset;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );
                                if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

                                shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );

                            #elif defined( SHADOWMAP_TYPE_PCF_SOFT )

                                // Percentage-close filtering
                                // (9 pixel kernel)
                                // http://fabiensanglard.net/shadowmappingPCF/

                                float shadow = 0.0;

                                float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
                                float yPixelOffset = 1.0 / shadowMapSize[ i ].y;

                                float dx0 = -1.0 * xPixelOffset;
                                float dy0 = -1.0 * yPixelOffset;
                                float dx1 = 1.0 * xPixelOffset;
                                float dy1 = 1.0 * yPixelOffset;

                                mat3 shadowKernel;
                                mat3 depthKernel;

                                depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
                                depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
                                depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
                                depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
                                depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
                                depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
                                depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
                                depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
                                depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );

                                vec3 shadowZ = vec3( shadowCoord.z );
                                shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));
                                shadowKernel[0] *= vec3(0.25);
                                                            
                                shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));
                                shadowKernel[1] *= vec3(0.25);

                                shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));
                                shadowKernel[2] *= vec3(0.25);

                                vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );

                                shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );
                                shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );

                                vec4 shadowValues;
                                shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );
                                shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );
                                shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );
                                shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );

                                shadow = dot( shadowValues, vec4( 1.0 ) );

                                shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );

                            #else

                                vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );
                                float fDepth = unpackDepth( rgbaDepth );

                                if ( fDepth < shadowCoord.z )

                                    // spot with multiple shadows is darker

                                    shadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );

                                    // spot with multiple shadows has the same color as single shadow spot

                                    //shadowColor = min( shadowColor, vec3( shadowDarkness[ i ] ) );

                            #endif

                        }


                        #ifdef SHADOWMAP_DEBUG

                            #ifdef SHADOWMAP_CASCADE

                                if ( inFrustum && inFrustumCount == 1 ) gl_FragColor.xyz *= frustumColors[ i ];

                            #else

                                if ( inFrustum ) gl_FragColor.xyz *= frustumColors[ i ];

                            #endif

                        #endif

                    }

                    #ifdef GAMMA_OUTPUT

                        shadowColor *= shadowColor;

                    #endif

                    gl_FragColor.xyz = gl_FragColor.xyz * shadowColor;

                #endif

                #ifdef GAMMA_OUTPUT

                    gl_FragColor.xyz = sqrt( gl_FragColor.xyz );

                #endif
                
                #ifdef USE_FOG

                    float depth = gl_FragCoord.z / gl_FragCoord.w;

                    #ifdef FOG_EXP2

                        const float LOG2 = 1.442695;
                        float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
                        fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

                    #else

                        float fogFactor = smoothstep( fogNear, fogFar, depth );

                    #endif

                    gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

                #endif

            }