import { THREE, attachEffects, effectLib } from "../../../dist/three-effects.js";

import initGround from "./ground.js";
import initSky from "./sky.js";
import initStatues from "./statues.js";
//import attachRaycast from "./raycast.js";

export default function (renderer, scene, camera, assets) {
    //attachRaycast(renderer, scene);
    var objects = {
        sky: initSky(renderer, scene, camera, assets),
        ground: initGround(renderer, scene, camera, assets),
        statues: initStatues(renderer, scene, camera, assets)
    }

    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;
	
    Object.values(objects).forEach(function (o) { scene.add(o); });
    
    camera.position.y = 1.75;

    var fx = attachEffects(scene);

    var allFX = {
//        ssao: true,
        bloom: true,
//        godrays: true,
//        outline: false,
//        filmgrain: true,
//        colors: false,
//        "!glitch": false,
//        "!fxaa": true
    }

    var bloomFx = effectLib.bloom(scene);
    scene.userData.bloom_internal.prePass.onBeforeCompile = function (shader) {
        shader.fragmentShader = shader.fragmentShader.replace("gl_FragColor", "alpha *= smoothstep(1., 0.9999, texture2D(depthTexture, vUv).r);\ngl_FragColor");
        console.log(shader);
    }
    bloomFx({ strength: 1, radius: 1, threshold: 0.7 });

    fx(["bloom"]);

    function setupFX() {
        var arr = [];
        for(var k in allFX) {
            if(allFX[k]) arr.push(k);
        }
        fx(arr);
    }

    scene.addEventListener("tick", function(e) {
        camera.rotation.y += 0.002;
    });
    scene.addEventListener("option", function(e) {
        if(e.name in allFX) {
            allFX[e.name] = e.value;
            setupFX();
        }
    });
}