import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth) / (window.innerHeight), 0.1, 1000);
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
let cube2 = new THREE.Mesh(geometry, material);
let cube3 = new THREE.Mesh(geometry, material);
let cube4 = new THREE.Mesh(geometry, material);
scene.add(cube);
scene.add(cube2);
scene.add(cube3);
scene.add(cube4);

camera.position.z = 10;
cube.position.y = 1.5;
cube4.position.y = -1.5;
cube2.position.x = 1.5;
cube3.position.x = -1.5;

// const loader = new GLTFLoader();

// loader.load('path/to/model.glb', function (gltf) {
//     scene.add(gltf.scene);
// }, undefined, function (error) {
//     console.error(error);
// });

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 0, 4);
scene.add(light);

function animate() {
    let rotation = 0.03;
    cube.rotation.x += rotation;
    cube2.rotation.y += rotation;
    cube3.rotation.y -= rotation;
    cube4.rotation.x -= rotation;
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
