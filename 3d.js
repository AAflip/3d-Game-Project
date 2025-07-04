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

let planeX = 5;
let planeZ = 200;

const loader = new THREE.TextureLoader();
const texture = loader.load('/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
texture.repeat.set(planeX / 2, planeZ / 2);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const smallGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const circGeo = new THREE.CircleGeometry(0.4, 50);
const flatGeo = new THREE.PlaneGeometry(planeX, planeZ);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true });
const material2 = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
const material3 = new THREE.MeshPhongMaterial({ color: 'blue' });
const material4 = new THREE.MeshPhongMaterial({ color: 'gold', side: THREE.DoubleSide });
const player = new THREE.Mesh(geometry, material);
let ground = new THREE.Mesh(flatGeo, material2);
scene.add(player);
scene.add(ground);

let moveInt = 0.2;

const playerBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

ground.position.y = -0.5;
player.position.z += 2;
ground.rotation.x = 1 / 2 * Math.PI;
camera.position.set(0, 2, 10);
ground.geometry.computeBoundingBox();


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
        let ranNum = Math.round(Math.random() * 2);
        if (ranNum === 1) { //cube
            if (geos[i]) {
                geos[i].position.x = (i - 2);
            }
            collects[i].position.x = -100;
        } else if (ranNum === 0) { //nothing
            if (geos[i]) {
                geos[i].position.x = -100;
            }
            collects[i].position.x = -100;
        } else if (ranNum === 2) { //coin
            geos[i].position.x = -100;
            collects[i].position.x = (i - 2);
        }
        collects[i].rotation.y = 0;
        bCollects[i].setFromObject(collects[i]);
    }
}

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
// }

function outOfBounds() {
    if (camera.position.z < geos[0].position.z) {
        for (let geoCheck of geos) {
            geoCheck.position.z = -20;
        }
        for (let coinCheck of collects) {
            coinCheck.position.z = -20;
        }
        spawnCubes();
        addPoints = true;
    }

    // if (camera.position.z < player.position.z) {
    //     player.position.z = -10;
    // }
    if (playerBox.min.x < ground.geometry.boundingBox.min.x) {
        player.position.x += moveInt;
    } else if (playerBox.max.x > ground.geometry.boundingBox.max.x) {
        player.position.x -= moveInt;
    }
}

let currentScore = -5;
let addPoints = true;
let coinsCollected = 0;

function checkCollision() {
    for (let box2 of bBoxes) {
        if (playerBox.containsBox(box2) || playerBox.intersectsBox(box2)) {
            scene.remove(player);
            gameOver(currentScore);
            return true
        } else {
            if (player.position.z > box2.max.z && addPoints) {
                currentScore += 5;
                addPoints = false;
            }
        }
    }
    for (let s = 0; s < bCollects.length; s++) {
        if (playerBox.containsBox(bCollects[s]) || playerBox.intersectsBox(bCollects[s])) {
            collects[s].position.x = -100;
            bCollects[s].setFromObject(collects[s]);
            currentScore += 20;
            coinsCollected++;
        }
    }
}

let bBoxes = [];
let geos = [];
let collects = [];
let bCollects = [];

function createGeos() {
    for (let i = 0; i < 5; i++) {
        let tempMesh = new THREE.Mesh(smallGeo, material3)
        geos.push(tempMesh);
        scene.add(tempMesh);
        tempMesh.position.z = -20;
        let tempBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        bBoxes.push(tempBox);
        tempBox.setFromObject(tempMesh);
        let tempCirc = new THREE.Mesh(circGeo, material4);
        let tempCircBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        collects.push(tempCirc);
        bCollects.push(tempCircBox);
        scene.add(tempCirc);
        tempCirc.position.z = -20;
        tempCircBox.setFromObject(tempCirc);
    }
    spawnCubes();
}

createGeos();

function gameOver(score) {
    let highScore = localStorage.getItem('highScore');
    if (highScore && highScore < score) {
        localStorage['highScore'] = score;
        highScore = score;
    } else if (!highScore) {
        localStorage.setItem('highScore', score);
        highScore = score;
    }
    renderer.forceContextLoss();
    renderer.setAnimationLoop(null);
    canvas.style.display = 'none';
    let div = document.createElement('div');
    document.querySelector('#scoreCounter').style.display = 'none';
    div.id = 'endScreen';
    div.innerHTML = `
   <h1>You Died!</h1>
   <h2>You got a score of ${score},<br>A highscore of ${highScore},<br>And collected ${coinsCollected} coins</h2>
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
            case 68:
                player.position.x += moveInt;
                break;
            case 65:
                player.position.x -= moveInt;
                break;
            case 32:
                if (jumpable && allowJump) {
                    player.position.y += 0.1;
                    gravity = 0.6;
                    jumpable = false;
                }
                break;
            // case 17:
            //     gravity -= 0.5;
            //     break;
        }
    }
}

function playerGravity() {
    player.position.y += gravity;
    gravity -= 0.07;
}

function moveObsticals() {
    for (let obj of geos) {
        obj.position.z += moveInt * 2;
    }
    for (let coin of collects) {
        coin.position.z += moveInt * 2;
    }
}

let gravity = 0;

function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    movePlayer();
    for (let j = 0; j < bBoxes.length; j++) {
        bBoxes[j].setFromObject(geos[j]);
    }
    for (let k = 0; k < collects.length; k++) {
        collects[k].rotation.y += 0.05;
        bCollects[k].max.z += moveInt * 2;
        bCollects[k].min.z += moveInt * 2;
    }

    if (player.position.y > (ground.position.y + 0.5)) {
        playerGravity();
    } else {
        gravity = 0;
    }

    if (player.position.y <= 0) {
        player.position.y = 0;
    }

    playerBox.setFromObject(player);
    checkCollision();
    outOfBounds();
    moveObsticals();
    document.querySelector('#scoreCounter').innerHTML = `Score: ${currentScore}`
    renderer.render(scene, camera);
}

document.querySelector('#start').addEventListener('click', (e) => {
    if (e.target.id == 'howTo') {
        document.querySelector('#startMenu').style.display = 'none';
        document.querySelector('#howText').style.display = 'flex';
    } else if (e.target.id == 'options') {
        document.querySelector('#startMenu').style.display = 'none';
        document.querySelector('#optionMenu').style.display = 'flex';
    } else if (e.target.id == 'startGame') {
        renderer.setAnimationLoop(animate);
        canvas.focus();
        document.querySelector('#scoreCounter').style.display = 'block';
        document.querySelector('#start').style.display = 'none';
    } else if (e.target.id == 'return') {
        document.querySelector('#startMenu').style.display = 'flex';
        document.querySelector('#howText').style.display = 'none';
        document.querySelector('#optionMenu').style.display = 'none';
    }
});

let jumpable = true;
let allowJump = true;

document.querySelector('#optionMenu').addEventListener('change', (e) => {
    let slider = document.querySelector('#moveRange');
    let input = document.querySelector('#moveNum');
    let check = document.querySelector('#jumpCheck');
    if (e.target.id == 'moveNum') {
        slider.value = input.value;
        moveInt = (input.value / 100);
    } else if (e.target.id == 'moveRange') {
        input.value = slider.value;
        moveInt = (slider.value / 100);
    } else if (e.target.id == 'jumpCheck') {
        allowJump = check.checked;
    }
});

let keyPressed = {};

document.querySelector('#canvas').addEventListener('keydown', (e) => {
    keyPressed[e.keyCode] = true;
    // console.log(e.keyCode);
});

document.querySelector('#canvas').addEventListener('keyup', (e) => {
    keyPressed[e.keyCode] = false;
});