
import * as THREE from "./libs/three.js";
import { WEBVR } from "./libs/WebVR.js";
import load from "./libs/loader.js";
import initGround from "./components/ground.js";
import initSky from "./components/sky.js"
import initPrimit from "./components/primit.js"
import attachInteract from "./components/interact.js";

export default function () {
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement)

  const scene = new THREE.Scene();

  attachInteract(scene);

    load(renderer, {
      "venus_model": "./src/assets/venus/index.obj",
      "venus_diffuse": "./src/assets/venus/diffuse.basis",
      "venus_material": "./src/assets/venus/arg.basis",
      "venus_normals": "./src/assets/venus/normals.png",
      
      "column_model": "./src/assets/column/index.obj",
      "column_diffuse": "./src/assets/column/diffuse.basis",
      "column_normals": "./src/assets/column/normals.png",
      
      "ground_diffuse": "./src/assets/ground/diffuse.basis",
      "ground_normals": "./src/assets/ground/normals.basis",
      "ground_material": "./src/assets/ground/arg.basis",

      "tick": "./src/assets/tick.wav",
      "woosh": "./src/assets/woosh.wav",
      "voop": "./src/assets/voop.wav",
      "zit": "./src/assets/zit.wav"
      
    }, function(pc){
      console.log("Loading"+ Math.floor(pc * 100) + "%");
    }).then(function(assets) {
      var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
        camera.position.set(20,80,0)
      
      var user = new THREE.Group();
      user.add(camera);
      user.add(renderer.vr.getController(0),renderer.vr.getController(1));
      scene.add(user);
      
      attachInteract(scene, {debug: true});

      var targetPos = new THREE.Vector3();
      var origPos = new THREE.Vector3();
  
      var teleportTime = 0;
  
      scene.addEventListener("teleport", function(e) {
          console.log("TELEPORT")
          scene.dispatchEvent({ type: "audio/woosh" });
          origPos.copy(user.position);
          targetPos.copy(e.position);
          teleportTime = window.performance.now();
      });
  
      scene.addEventListener("beforeRender", function(e) {
          user.position.copy(origPos);
          user.position.lerp( targetPos, 1 - Math.pow( 1 - Math.min(1, (e.time - teleportTime) / 900 ), 6) );
      });

      const light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(0,250,0)
      scene.add( light )

      camera.lookAt(new THREE.Vector3(0,0,0))


      // initScene(renderer, scene, camera, assets);
      const ground = initGround(renderer, scene, camera, assets);
      scene.add( ground )

      const sky = initSky(renderer, scene, camera, assets);
      scene.add( sky )

      const primit = initPrimit(renderer, scene, camera, assets);
      scene.add(primit);
      
      document.body.appendChild( WEBVR.createButton( renderer ) );

      renderer.setAnimationLoop( function (time) {
        scene.dispatchEvent({type: "beforeRender", renderer, camera, time: window.performance.now()});
        renderer.render( scene, camera );
      });


    });


  var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
}


