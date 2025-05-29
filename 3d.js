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
canvas.focus();

let planeX = 5;
let planeZ = 20;

const loader = new THREE.TextureLoader();
const texture = loader.load('/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
texture.repeat.set(planeX / 2, planeZ / 2);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const smallGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
const flatGeo = new THREE.PlaneGeometry(planeX, planeZ);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true });
const material2 = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
const material3 = new THREE.MeshPhongMaterial({ color: 'blue' });
const player = new THREE.Mesh(geometry, material);
let cube1 = new THREE.Mesh(smallGeo, material3);
let cube2 = new THREE.Mesh(smallGeo, material3);
let cube3 = new THREE.Mesh(smallGeo, material3);
let cube4 = new THREE.Mesh(smallGeo, material3);
let cube5 = new THREE.Mesh(smallGeo, material3);
let plane = new THREE.Mesh(flatGeo, material2);
scene.add(player);
scene.add(cube1);
scene.add(cube2);
scene.add(cube3);
scene.add(cube4);
scene.add(cube5);
scene.add(plane);

const group = new THREE.Group();

group.add(cube1);
group.add(cube2);
group.add(cube3);
group.add(cube4);
group.add(cube5);
group.position.set(0,0,0);
group.visible = true;

let moveInt = 0.5;

const playerBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
const cube1Box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
const cube2Box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
const cube3Box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
const cube4Box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
const cube5Box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1Box.setFromObject(cube1);
cube2Box.setFromObject(cube2);
cube3Box.setFromObject(cube3);
cube4Box.setFromObject(cube4);
cube5Box.setFromObject(cube5);

plane.position.y = -0.5;
player.position.x += 1;
plane.rotation.x = 1 / 2 * Math.PI;
camera.position.set(0, 2, 10);
plane.geometry.computeBoundingBox();


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
            keysPressing.push(parseInt(key));
        }
    }
    return keysPressing
}

async function spawnCubes() {
    for (let i = 0; i < 5; i++) {
        if (Math.round(Math.random()) === 1) {
            if (geos[i]) {
                geos[i].position.x = (i - 2);
            }
        } else {
            if (geos[i]) {
                geos[i].position.x = -100;
            }
        }
    }
}

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
// }

function outOfBounds() {
    for (let geoCheck of geos) {
        if (camera.position.z < geoCheck.position.z) {
            geoCheck.position.set(-100,0,0);
        }
    }
    // if (camera.position.z < player.position.z) {
    //     player.position.z = -10;
    // }
    // if (playerBox.min.x < plane.geometry.boundingBox.min.x) {
    //     player.position.x += moveInt;
    // } else if (playerBox.max.x > plane.geometry.boundingBox.max.x) {
    //     player.position.x -= moveInt;
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

let bBoxes = [cube1Box, cube2Box, cube3Box, cube4Box, cube5Box];
let geos = [cube1, cube2, cube3, cube4, cube5];

function createGeos(size, num, material) {
    let geo = new THREE.BoxGeometry(size, size, size);
    let funcMaterial = new THREE.MeshPhongMaterial({ color: material, flatShading: true });
    for (let i = 0; i < num; i++) {
        geos.push(new THREE.Mesh(geo, funcMaterial));
    }
}

function gameOver(score) {
    let highScore = localStorage.getItem('highScore');
    if (highScore && highScore < score) {
        localStorage['highScore'] = score;
    } else if (!highScore) {
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
    let movement = moveKeys();
    for (let moves of movement) {
        switch (moves) {
            case 39:
                player.position.x += moveInt;
                break;
            case 37:
                player.position.x -= moveInt;
                break;
            case 38:
                player.position.z -= moveInt;
                break;
            case 40:
                player.position.z += moveInt;
                break;
            case 68:
                player.position.x += moveInt;
                break;
            case 65:
                player.position.x -= moveInt;
                break;
            case 87:
                player.position.z -= moveInt;
                break;
            case 83:
                player.position.z += moveInt;
                break;
        }
    }
}
let numer = 0;

function animate() {
    if(numer >= 10){
        numer = 0;
    }
    if (resizeRendererToDisplaySize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    movePlayer();
    for (let j = 0; j < bBoxes.length; j++) {
        bBoxes[j].setFromObject(geos[j]);
    }
    if(numer == 1){
        spawnCubes();
    }
    playerBox.setFromObject(player);
    // cube2.position.z += moveInt;
    checkCollision();
    outOfBounds();
    renderer.render(scene, camera);
    // numer++
    console.log(group);
}
renderer.setAnimationLoop(animate);

let keyPressed = {};

document.querySelector('#canvas').addEventListener('keydown', (e) => {
    keyPressed[e.keyCode] = true;
});

document.querySelector('#canvas').addEventListener('keyup', (e) => {
    keyPressed[e.keyCode] = false;
});