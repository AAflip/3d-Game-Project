import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth) / (window.innerHeight), 0.1, 1000);
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
const texture = loader.load('/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
texture.repeat.set(5, 5);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const flatGeo = new THREE.PlaneGeometry(10, 10);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true });
const material2 = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
const cube = new THREE.Mesh(geometry, material);
let plane = new THREE.Mesh(flatGeo, material2);
scene.add(cube);
scene.add(plane);

plane.position.y = -1;
// plane.position.y = 48;
plane.rotation.x = 1 / 2 * Math.PI;
// camera.rotation.x = 1.3;
camera.position.set(0, 2, 10);
// camera.rotation.x = (Math.PI/2);
// plane.rotation.x = Math.PI;

// const loader = new GLTFLoader();

// loader.load('path/to/model.glb', function (gltf) {
//     scene.add(gltf.scene);
// }, undefined, function (error) {
//     console.error(error);
// });

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

function resizeRendererToDisplaySize(renderer) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function movePlayer() {
    for (let key of Object.keys(keyPressed)) {
        if (keyPressed[key] == true) {
            console.log(key);
            return key
        }
    }
}

function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    let moveInt = 0.1;
    
    switch (movePlayer()) {
        case 'ArrowRight':
            cube.position.x += moveInt;
            break;
        case 'ArrowLeft':
            cube.position.x -= moveInt;
            break;
        case 'ArrowUp':
            cube.position.z -= moveInt;
            break;
        case 'ArrowDown':
            cube.position.z += moveInt;
            break;
        case 'Control':
            cube.position.y -= moveInt;
            break;
        case ' ':
            cube.position.y += moveInt;
            break;
    }
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
let keyPressed = {};

document.querySelector('#canvas').addEventListener('keydown', (e) => {
    keyPressed[e.key] = true;
});

document.querySelector('#canvas').addEventListener('keyup', (e) => {
    keyPressed[e.key] = false;
});