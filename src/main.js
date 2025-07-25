import './style.css'

import * as THREE from 'three';
import { gsap } from "gsap";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



const scene = new THREE.Scene();
const canvas = document.querySelector('#experience');



const axesHelper = new THREE.AxesHelper( 100 );
axesHelper.position.set(50, 50, 50);
scene.add( axesHelper );



const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const aspect = sizes.width / sizes.height;



let character = {
  instance: null,
  moveDistance: 3,
  jumpHeight: 1,
  jumpDuration: 0.2,
  isMoving: false,
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const intersectObjectsNames = [
  'big_tree',
  'big_tree001',
  'big_tree003',
  'directions',
  'project1',
  'project2',];
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



const controls = new OrbitControls( camera, canvas );
controls.update();



const dracoLoader = new DRACOLoader();

// Specify path to a folder containing WASM/JS decoding libraries.
dracoLoader.setDecoderPath( '/draco/' );

// Optional: Pre-fetch Draco WASM/JS module.
dracoLoader.preload();
const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

loader.load( '/models/crossy_blocks-v1.glb', function ( glb ) {
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

function moveCharacter(targetPosition, targetRotation) {
  character.isMoving = true;

  let rotationDiff =
    ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
      3 * Math.PI) %
      (2 * Math.PI)) -
    Math.PI;
  let finalRotation = character.instance.rotation.y + rotationDiff;


  const t1 = gsap.timeline({ onComplete: () => {
    character.isMoving = false;
  }});

  t1.to(character.instance.position, {
    duration: character.jumpDuration,
    x: targetPosition.x,
    z: targetPosition.z,
    
  });

  t1.to(character.instance.rotation, {
    duration: character.jumpDuration ,
    y: finalRotation,
  }, 0);

  t1.to(character.instance.position, 
  {
    y: character.instance.position.y + character.jumpHeight,
    duration: character.jumpDuration/2 ,
    yoyo: true,
    repeat: 1,
    ease: "power1.inOut",
  }, "<");
}


function onKeyDown( event ) {
  console.log(event);
  if (character.isMoving) return;

  const targetPosition = new THREE.Vector3().copy(character.instance.position);
  let targetRotation = 0;

  switch(event.code.toLowerCase()) {
    case 'keyw':
    case 'arrowup':
      targetPosition.x -= character.moveDistance;
      targetRotation = Math.PI / 2; // CHECK ROTATIONS PLS
      break;
    case 'keys':
    case 'arrowdown':
      targetPosition.x += character.moveDistance;
      targetRotation = -Math.PI / 2;
      break;
    case 'keya':
    case 'arrowleft':
      targetPosition.z += character.moveDistance;
      targetRotation = 0;
      break;
    case 'keyd':
    case 'arrowright':
      targetPosition.z -= character.moveDistance;
      targetRotation = Math.PI;
      break;
    default:
      return; // Exit if the key pressed is not one of the specified keys
    
  }
  moveCharacter(targetPosition, targetRotation);
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
  console.log(intersectObject);
  // add functionalities
}



window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener('resize', onResize);
window.addEventListener('click', onClick);
window.addEventListener('keydown', onKeyDown);



function animate() {
  requestAnimationFrame( animate );
  onResize();
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
	  intersectObject = intersects[0].object.parent.name;
	}
  if (character.instance) {
    const targetCameraPosition = new THREE.Vector3(
      character.instance.position.x + cameraOffset.x,
      camera.position.y,
      character.instance.position.z + cameraOffset.z
    )
    camera.position.copy(targetCameraPosition);
    camera.lookAt(character.instance.position.x, 0, character.instance.position.z);
  }
  

  renderer.render( scene, camera );
  
} 
animate();