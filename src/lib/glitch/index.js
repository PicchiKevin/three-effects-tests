import * as THREE from "three";

THREE.ShaderChunk["glitch_pars"] = `
    uniform sampler2D glitch_tDisp;
	uniform float glitch_amount;
	uniform float glitch_snow;
    uniform float glitch_angle;
    uniform float glitch_seed;
    uniform float glitch_seed_x;
    uniform float glitch_seed_y;
    uniform float glitch_distortion_x;
    uniform float glitch_distortion_y;
	uniform float glitch_col_s;
	uniform float glitch_intensity;
    
    float glitch_rand(vec2 co){
		return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
	}
				
	void glitch_apply(inout vec4 fragColor, vec2 uv) {
			vec2 p = uv;
			vec2 p2 = p;
            float xs = floor(gl_FragCoord.x / 0.5);
			float ys = floor(gl_FragCoord.y / 0.5);
            
            //based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
			vec4 normal = texture2D(glitch_tDisp, p2 * glitch_seed * glitch_seed);
			if(p2.y < glitch_distortion_x + glitch_col_s && p2.y > glitch_distortion_x - glitch_col_s * glitch_seed) {
				if(glitch_seed_x>0.){
					p.y = 1. - (p.y + glitch_distortion_y);
				}
				else {
					p.y = glitch_distortion_y;
				}
			}
			if(p2.x < glitch_distortion_y + glitch_col_s && p2.x > glitch_distortion_y - glitch_col_s * glitch_seed) {
				if( glitch_seed_y > 0.){
					p.x = glitch_distortion_x;
				}
				else {
					p.x = 1. - (p.x + glitch_distortion_x);
				}
			}
			p.x+=normal.x* glitch_seed_x * (glitch_seed/5.);
			p.y+=normal.y* glitch_seed_y * (glitch_seed/5.);
            
            //base from RGB shift shader
			vec2 offset = glitch_amount * vec2( cos(glitch_angle), sin(glitch_angle));
			vec4 cr = texture2D(colorTexture, p + offset);
			vec4 cga = texture2D(colorTexture, p);
			vec4 cb = texture2D(colorTexture, p - offset);
			vec4 color = vec4(cr.r, cga.g, cb.b, cga.a);
            
            //add noise
			vec4 snow = 200.*glitch_amount*vec4(glitch_rand(vec2(xs * glitch_seed,ys * glitch_seed*50.))*0.2);
			color = color + glitch_snow * snow;

			fragColor = mix(fragColor, color, glitch_intensity);
	}
`;

export default function (scene, config) {
    var curF = 0;
    var randX = 0;

    var generateTrigger = function() {

		randX = THREE.Math.randInt( 120, 240 );

	};

	var generateHeightmap = function( dt_size ) {

		var data_arr = new Float32Array( dt_size * dt_size * 3 );
		var length = dt_size * dt_size;

		for ( var i = 0; i < length; i ++ ) {

			var val = THREE.Math.randFloat( 0, 1 );
			data_arr[ i * 3 + 0 ] = val;
			data_arr[ i * 3 + 1 ] = val;
			data_arr[ i * 3 + 2 ] = val;

		}

		var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
		texture.needsUpdate = true;
		return texture;

    }
	
	var controlUniforms = {
        "tDisp":		{ type: "t", value: generateHeightmap( 64 ) },
		"amount":		{ type: "f", value: 0.08 },
		"snow":		{ type: "f", value: 0.5 },
        "angle":		{ type: "f", value: 0.02 },
        "seed":			{ type: "f", value: 0.02 },
        "seed_x":		{ type: "f", value: 0.02 },//-1,1
        "seed_y":		{ type: "f", value: 0.02 },//-1,1
        "distortion_x":	{ type: "f", value: 0.5 },
        "distortion_y":	{ type: "f", value: 0.6 },
		"col_s":		{ type: "f", value: 0.05 },
		"intensity":		{ type: "f", value: 0.33 }
    };

	for(var k in controlUniforms) {
        scene.userData["glitch_" + k] = controlUniforms[k];
    }

	scene.glitch = controlUniforms;

    scene.addEventListener("beforeRender", function () {
        controlUniforms[ 'seed' ].value = Math.random();//default seeding	
		if ( curF % randX == 0) {
			controlUniforms[ 'amount' ].value = Math.random() / 30;
			controlUniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			controlUniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 1, 1 );
			controlUniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 1, 1 );
			controlUniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			controlUniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			curF = 0;
			generateTrigger();
		} else if ( curF % randX < randX / 5 ) {
			controlUniforms[ 'amount' ].value = Math.random() / 90;
			controlUniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			controlUniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			controlUniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			controlUniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
			controlUniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
		} 
		curF++;
    });

    var fn = function (arg) {
        if(arg) {

			for(var k in controlUniforms) {
				if(arg[k] !== undefined && k in controlUniforms) controlUniforms[k].value = arg[k];
			}

            curF = 0;
            generateTrigger();
        } else {
            for(k in controlUniforms) {
                delete scene.userData["glitch_" + k]; 
			}
        }
	}
	
	fn(config);

	return fn;
}