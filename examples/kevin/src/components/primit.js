import {THREE} from "../libs/three-effects.js";
import pop from "./pop.js";

export default function (renderer, scene, camera, assets) {
    pop(scene);

    var group = new THREE.Group();

    const mat = new THREE.MeshBasicMaterial({color: 0xff0000})
    const geo = new THREE.BoxGeometry(5, 10, 5)
    const cube = new THREE.Mesh(geo, mat)
        cube.position.y = geo.parameters.height/2
        cube.receiveShadow = true
    group.add(cube)

    return group

}