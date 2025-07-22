import './style.css'

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const scene = new THREE.Scene();
const canvas = document.querySelector('#experience');

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
scene.add(sun);

const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
scene.add( shadowHelper );
const lightHelper = new THREE.DirectionalLightHelper( sun, 5 );
scene.add( lightHelper );


const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
   -aspect*50, aspect*50, 50, -50, 0.1, 1000 );

camera.position.x = 86;
camera.position.y = 50;
camera.position.z = -60;
camera.updateProjectionMatrix();


const axesHelper = new THREE.AxesHelper( 100 );
axesHelper.position.set(50, 50, 50);
scene.add( axesHelper );


const controls = new OrbitControls( camera, canvas );
controls.update();

// Instantiate a loader
const dracoLoader = new DRACOLoader();

// Specify path to a folder containing WASM/JS decoding libraries.
dracoLoader.setDecoderPath( '/draco/' );

// Optional: Pre-fetch Draco WASM/JS module.
dracoLoader.preload();
const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

loader.load( '/models/crossy_blocks-v1.glb', function ( glb ) {
  console.log( glb );

  scene.add( glb.scene );
  glb.scene.traverse( function ( child ) {
    if ( child.isMesh ) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  } );

}, undefined, function ( error ) {

  console.error( error );

} );


scene.add( loader );


function handleResize() {
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

window.addEventListener('resize', handleResize);

function animate() {
  handleResize();
  renderer.render( scene, camera );
  
}
renderer.setAnimationLoop( animate );