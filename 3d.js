import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import Jolt from 'https://www.unpkg.com/jolt-physics/dist/jolt-physics.wasm-compat.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth) / (window.innerHeight), 0.1, 1000);
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: false });
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
const material3 = new THREE.MeshPhongMaterial({ color: 'blue' });
const player = new THREE.Mesh(geometry, material);
let cube2 = new THREE.Mesh(geometry, material3);
let plane = new THREE.Mesh(flatGeo, material2);
scene.add(player);
scene.add(cube2);
cube2.position.x += 5;
scene.add(plane);

const playerBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
// cube1Box.setFromObject(cube);
// cube1Box.union(cube);
const cube2Box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube2Box.setFromObject(cube2);

plane.position.y = -1;
// plane.position.y = 48;
plane.rotation.x = 1 / 2 * Math.PI;
// camera.rotation.x = 1.3;
camera.position.set(0, 2, 10);
// camera.rotation.x = (Math.PI/2);
// plane.rotation.x = Math.PI;
plane.geometry.computeBoundingBox();

const helper = new THREE.Box3Helper(plane.geometry.boundingBox, 0xffff00);
scene.add(helper);

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

// const controls = new OrbitControls(camera, canvas);
// controls.target.set(0, 5, 0);
// controls.update();

function resizeRendererToDisplaySize(renderer) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function moveKeys() {
    let keysPressing = []
    for (let key of Object.keys(keyPressed)) {
        if (keyPressed[key] == true) {
            keysPressing.push(key);
        }
    }
    return keysPressing
}

function outOfBounds() {
    for (let geoCheck of geos) {
        if (camera.position.z < geoCheck.position.z) {
            geoCheck.position.z = -10;
        }
    }
    if (camera.position.z < player.position.z) {
        player.position.z = -10;
    }
    // if (playerBox.min.x < plane.geometry.boundingBox.min.x) {
    //     player.position.x += 0.5;
    // } else if (playerBox.max.x > plane.geometry.boundingBox.max.x) {
    //     player.position.x -= 0.5;
    // }
}

let currentScore = 0;

function checkCollision() {
    for (let box2 of bBoxes) {
        if (playerBox.containsBox(box2) || playerBox.intersectsBox(box2)) {
            scene.remove(player);
            gameOver(currentScore);
        } else {
            currentScore++;
        }
    }
}


let bBoxes = [cube2Box];
let geos = [cube2];

function createGeos(size, num, material) {
    let geo = new THREE.BoxGeometry(size, size, size);
    let funcMaterial = new THREE.MeshPhongMaterial({ color: material, flatShading: true });
    for (let i = 0; i < num; i++) {
        geos.push(new THREE.Mesh(geo, funcMaterial));
    }
}

function gameOver(score) {
    // localStorage.setItem('highScore', score);
    let highScore = localStorage.getItem('highScore');
    if(highScore && highScore < score){
        localStorage['highScore'] = score;
    }else if(!highScore){
        localStorage.setItem('highScore', score);
    }
    renderer.forceContextLoss();
    renderer.setAnimationLoop(null);
    canvas.style.display = 'none';
    let div = document.createElement('div');
    div.id = 'endScreen';
    div.innerHTML = `
   <h1>You Died!</h1>
   <h2>You got a score of ${score}<br>And a highscore of ${highScore}</h2>
   <button onclick='window.location.reload()'>Retry</button>
   `
    document.body.appendChild(div);
}

function movePlayer() {
    let moveInt = 0.5;
    let movement = moveKeys();
    for (let moves of movement) {
        switch (moves) {
            case 'ArrowRight':
                player.position.x += moveInt;
                break;
            case 'ArrowLeft':
                player.position.x -= moveInt;
                break;
            case 'ArrowUp':
                player.position.z -= moveInt;
                break;
            case 'ArrowDown':
                player.position.z += moveInt;
                break;
            case 'd':
                cube2.position.x += moveInt;
                break;
            case 'a':
                cube2.position.x -= moveInt;
                break;
            case 'w':
                cube2.position.z -= moveInt;
                break;
            case 's':
                cube2.position.z += moveInt;
                break;
        }
    }
}

function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // if(playerBox.intersectsBox(plane.geometry.boundingBox)){
    movePlayer();
    // }
    // console.log(plane);
    for (let j = 0; j < bBoxes.length; j++) {
        bBoxes[j].setFromObject(geos[j]);
    }
    playerBox.setFromObject(player);
    // cube2.position.z += 0.5;
    checkCollision();
    outOfBounds();
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