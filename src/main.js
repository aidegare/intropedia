import './style.css'

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/addons/math/Capsule.js";
import { gsap } from 'gsap';



const scene = new THREE.Scene();
const canvas = document.querySelector('#experience');

const clock = new THREE.Clock();
const canvasStats = document.getElementById('stats');

const stats = new Stats();
canvasStats.appendChild( stats.dom );

// Uncomment to see axes helper
// const axesHelper = new THREE.AxesHelper( 100 );
// axesHelper.position.set(50, 50, 50);
// scene.add( axesHelper );



const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const aspect = sizes.width / sizes.height;


// PHYSICS WOOOOO
const GRAVITY = 30;
const CAPSULE_RADIUS = 0.35;
const CAPSULE_HEIGHT = 1.5;
const JUMP_FORCE = 30;
const MO_SPEED = 30;



let character = {
  instance: null,
  isMoving: false,
  spawnPosition: new THREE.Vector3(),
};
let targetRotation = 0;
let isJumping = false;


let prop = {
  instance: null,
  jumpHeight: 2,
  jumpDuration: 0.2,
  isDoorOpen: false,
};




const colliderOctree = new Octree();
const playerCollider = new Capsule(
  new THREE.Vector3(0, CAPSULE_RADIUS, 0),
  new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
  CAPSULE_RADIUS,
);

let playerOnFloor = false;
let playerVelocity = new THREE.Vector3(0, 0, 0);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const intersectObjectsNames = [
  'big_tree',
  'big_tree001',
  'big_tree002',
  'directions',
  'project1',
  'project2',
  'door',
];
const intersectObjects = [];
let intersectObject = "";



const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
renderer.setSize( sizes.width, sizes.height );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;


const sun  = new THREE.DirectionalLight(0xffffff);
sun.position.set(80, 200, -100);
sun.target.position.set(-20, 0, -20);
sun.castShadow = true;
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.camera.left = -150;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
sun.shadow.normalBias = 0.5;
scene.add( sun.target );
scene.add(sun);

// uncomment to see area of shadows cast and where light is
// const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
// scene.add( shadowHelper );
// const lightHelper = new THREE.DirectionalLightHelper( sun, 5 );
// scene.add( lightHelper );



const camera = new THREE.OrthographicCamera(
   -aspect*50, aspect*50, 50, -50, 0.1, 1000 );

camera.position.x = 86;
camera.position.y = 50;
camera.position.z = -60;
camera.zoom = 3;
const cameraOffset = new THREE.Vector3(86, 50, -60);
// const controls = new OrbitControls(camera, canvas);
// controls.update();


const dracoLoader = new DRACOLoader();

// Specify path to a folder containing WASM/JS decoding libraries.
dracoLoader.setDecoderPath( './draco/' );

// Optional: Pre-fetch Draco WASM/JS module.
dracoLoader.preload();
const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );



loader.load( './models/crossy_road_w_colliders.glb', function ( glb ) {
  scene.add( glb.scene );
  // tell light that if child is mesh, then cast shadows
  glb.scene.traverse( function ( child ) {
    if (intersectObjectsNames.includes(child.name)) {
      intersectObjects.push(child);
    }
    if ( child.isMesh ) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
    if (child.name === 'BOB001') {
      character.instance = child;
      character.spawnPosition.copy(child.position);
      playerCollider.start.copy(child.position).add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
      playerCollider.end.copy(child.position).add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
    }
    if (child.name === 'collider') {
      colliderOctree.fromGraphNode(child);
      child.visible = false;
    }
  } );

}, undefined, function ( error ) {
  console.error( error );
} );

scene.add( loader );





function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

// kept movements for reference, not used in this version
// function moveCharacter(targetPosition, targetRotation) {
//   character.isMoving = true;

//   let rotationDiff =
//     ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
//       3 * Math.PI) %
//       (2 * Math.PI)) -
//     Math.PI;
//   let finalRotation = character.instance.rotation.y + rotationDiff;


//   const t1 = gsap.timeline({ onComplete: () => {
//     character.isMoving = false;
//   }});

//   t1.to(character.instance.position, {
//     duration: character.jumpDuration,
//     x: targetPosition.x,
//     z: targetPosition.z,
    
//   });

//   t1.to(character.instance.rotation, {
//     duration: character.jumpDuration ,
//     y: finalRotation,
//   }, 0);

//   t1.to(character.instance.position, 
//   {
//     y: character.instance.position.y + character.jumpHeight,
//     duration: character.jumpDuration/2 ,
//     yoyo: true,
//     repeat: 1,
//     ease: "power1.inOut",
//   }, "<");
// }

//respawns the character to its original position
function respawnCharacter() {
  if (!character.instance) return;
  character.instance.position.copy(character.spawnPosition);

  playerCollider.start.copy(character.spawnPosition).add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
  playerCollider.end.copy(character.spawnPosition).add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
  
  character.isMoving = false;
  playerVelocity.set(0, 0, 0);
  targetRotation = 0;
  character.instance.rotation.x = Math.PI;
  
  
}

// handles the collisions of the player with the environment
function playerCollisions() {
  const result = colliderOctree.capsuleIntersect(playerCollider);
  playerOnFloor = false;
  if (result) {
    playerOnFloor = result.normal.y > 0;
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
  if (playerOnFloor){
    character.isMoving = false;
    playerVelocity.x = 0;
    playerVelocity.z = 0;
  }
}




const pressedButtons = {
  up: false,
  left: false,
  right: false,
  down: false,
};

const keysPressed = {};
let t1;
function onKeyDown( event ) {
  // console.log(event);
  if (character.isMoving) return;
  // console.log(event.code.toLowerCase());
  const keyEvent = event.code.toLowerCase();
  
  if (!event.repeat)
    keysPressed[keyEvent] = true;

  if (keyEvent === 'keyr') {
    respawnCharacter();
  }

    // multiple keys
  switch (true) {
    case keysPressed['keyo'] && keysPressed['keyp']:
      console.log('One Piece is REAAAAAL!');
      break;
    case keysPressed['arrowleft'] && keysPressed['arrowright']:
    case keysPressed['keya'] && keysPressed['keyd']:
      t1 = gsap.timeline();
      t1.to(character.instance.rotation, {
        duration: 0.6,
        y: character.instance.rotation.y + Math.PI * 2,
      });
      pressedButtons.left = false;
      pressedButtons.right = false;
      break;
    case keysPressed['arrowup'] && keysPressed['arrowdown']:
    case keysPressed['keyw'] && keysPressed['keys']:
      t1 = gsap.timeline();
      t1.to(character.instance.rotation, {
        duration: 0.6,
        y: character.instance.rotation.y + Math.PI * 2,
      });
      pressedButtons.up = false;
      pressedButtons.down = false;
      break;

    default:
      break;
  }

  

  switch (keyEvent) {
    case 'keyw':
    case 'arrowup':
      pressedButtons.up = true;
      break;

    case 'keys':
    case 'arrowdown':
      pressedButtons.down = true;
      break;  
    
    case 'keya':
    case 'arrowleft':
      pressedButtons.left = true;
      break;  

    case 'keyd':
    case 'arrowright':
      pressedButtons.right = true;
      break;
    
    default:
      return; // Exit if the key pressed is not one of the specified keys
  }
}



function onKeyUp( event ) {
  // console.log(event);

  if (!event.repeat)
    delete keysPressed[event.code.toLowerCase()];
  switch (event.code.toLowerCase()) {
    case "keyw":
    case "arrowup":
      pressedButtons.up = false;
      isJumping = false;
      break;

    case "keys":
    case "arrowdown":
      pressedButtons.down = false;
      isJumping = false;
      break;

    case "keya":
    case "arrowleft":
      pressedButtons.left = false;
      isJumping = false;
      break;

    case "keyd":
    case "arrowright":
      pressedButtons.right = false;
      isJumping = false;
      break;
    default:
      return;

  }
  character.isMoving = false;
}





function handleContinuousMovement() {
  if (!character.instance) return;
  if (
    Object.values(pressedButtons).some((pressed) => pressed) &&
    !character.isMoving && playerOnFloor
  ){
    if (pressedButtons.up) {
      playerVelocity.x -= MO_SPEED;
      targetRotation = Math.PI / 2; // CHECK ROTATIONS PLS
    }
    if (pressedButtons.down) {
      playerVelocity.x += MO_SPEED;
      targetRotation = -Math.PI / 2;
    }
    if (pressedButtons.left) {
      isJumping = true;
      playerVelocity.z += MO_SPEED;
      targetRotation = 0;
    }
    if (pressedButtons.right) {
      playerVelocity.z -= MO_SPEED;
      targetRotation = Math.PI;
    }
    isJumping = true;
    playerOnFloor = false; // until collision detects floor again
    playerVelocity.y = JUMP_FORCE;
  
}

  
  
  

}



// handles the resizing of the window
function onResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  const aspect = sizes.width / sizes.height;
  camera.left = -aspect * 50;
  camera.right = aspect * 50;
  camera.top = 50;
  camera.bottom = -50;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
}




function onClick() {
  // console.log(intersectObject);
  prop.instance = intersectObject;
  const t1 = gsap.timeline();

  const trees = ['big_tree', 'big_tree001', 'big_tree002'];
  const projects = ['project1', 'project2'];
  const props = ['directions', 'door'];

  if (!prop.instance) return;


  if (trees.includes(prop.instance.name)) {
    t1.to(prop.instance.position, {
      duration: prop.jumpDuration*2,
      y: prop.instance.position.y + prop.jumpHeight*5,
      yoyo: true,
      repeat: 1,
    });
    t1.to(prop.instance.rotation, {
      duration: 1,
      y: prop.instance.rotation.y + Math.PI * 2,
    }, 0);
    t1.to(prop.instance.scale, {
      duration: prop.jumpDuration*2,
      x: prop.instance.scale.x * 1.2,
      y: prop.instance.scale.y * 1.2,
      z: prop.instance.scale.z * 1.2,
      yoyo:true,
      repeat:1,
    }, 0);
  }

  if (projects.includes(prop.instance.name)) {
    // smth for projects
    console.log("You clicked on a project!");
  }

  if (props.includes(prop.instance.name)) {
    console.log("You clicked on a prop!");
    // door opening/closing
    if (prop.instance.name === 'door'){
      const door = prop.instance;
      const t1 = gsap.timeline();

    if (!prop.isDoorOpen) {
      
      t1.to(door.rotation, {
        duration: 1,
        y: door.rotation.y + Math.PI * 0.7,
        ease: "power2.out"
      });
    } else {
      
      t1.to(door.rotation, {
        duration: 1,
        y: door.rotation.y - Math.PI * 0.7,
        ease: "power2.Out"
      });
    }
    prop.isDoorOpen = !prop.isDoorOpen;
    }
  }
}

// handles player movement, if they fall, if they're on the floor, checks for collisions
// also handles the rotation of the player
// lerps the rotation to make it smoother
function updatePlayer(){
  if (!character.instance || character.isFlipping) return;

  if( character.instance.position.y < -20) {
    respawnCharacter();
    return;
  }
  
  if (!playerOnFloor) {
    playerVelocity.y -= GRAVITY * 0.1;
  } 

  playerCollider.translate(playerVelocity.clone().multiplyScalar(0.01));

  playerCollisions();

  character.instance.position.copy(playerCollider.start);
  character.instance.position.y -= CAPSULE_RADIUS;

  let rotationDiff =
    ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
      3 * Math.PI) %
      (2 * Math.PI)) - Math.PI;

  let finalRotation = character.instance.rotation.y + rotationDiff;

  character.instance.rotation.y = THREE.MathUtils.lerp(
    character.instance.rotation.y,
    finalRotation,
    0.1
  );
  
}



window.addEventListener("blur", () => {
  Object.keys(pressedButtons).forEach((key) => {
    pressedButtons[key] = false;
  });
});

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener('resize', onResize);
window.addEventListener('click', onClick);
window.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);



function animate() {
  requestAnimationFrame( animate );
  onResize();
  updatePlayer();
  handleContinuousMovement();
  stats.update();
  


  // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );



	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( intersectObjects);

  if( intersects.length > 0 ) {
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = 'default';
    intersectObject = "";
  }

	for ( let i = 0; i < intersects.length; i ++ ) {
	  intersectObject = intersects[0].object.parent;
	}
  // camera position follows the character
  if (character.instance) {
    const targetCameraPosition = new THREE.Vector3(
      character.instance.position.x + cameraOffset.x,
      camera.position.y,
      character.instance.position.z + cameraOffset.z
    )
    camera.position.copy(targetCameraPosition);
    camera.lookAt(character.instance.position.x, 2, character.instance.position.z);

}

  renderer.render( scene, camera );
  
} 
animate();