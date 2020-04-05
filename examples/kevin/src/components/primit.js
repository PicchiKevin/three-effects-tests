import * as THREE from "../libs/three.js";
import pop from "./pop.js";

export default function (renderer, scene, camera, assets) {
    pop(scene);

    var group = new THREE.Group();

    const mat = new THREE.MeshBasicMaterial({color: 0xff0000})
    const geo = new THREE.BoxGeometry(5, 10, 5)
    const cube = new THREE.Mesh(geo, mat)
        cube.position.y = geo.parameters.height/2;
        cube.receiveShadow = true

        scene.dispatchEvent({ type: "interact/register", entity: cube });
        scene.dispatchEvent({ type: "label/register", visible: false, entity: cube, text: "Testing label", scale: 3, disabled: false});
        cube.addEventListener("interact/enter",function () {
            cube.userData.label.visible = true;
        });

        cube.addEventListener("interact/leave",function () {
            cube.userData.label.visible = false;
        });
    group.add(cube)

    return group

}