// Módulos necesarios
import * as THREE from "/lib/three.module.js"

//Necesitamos una escena, una camara
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//También necesitamos un renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Creamos el cubo
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial( { color : 0x220044});
const cube = new THREE.Mesh( geometry, material );
scene.add(cube);

camera.position.z = 5;

//Render
function animate() {
    requestAnimationFrame( animate);
    //Animamos el cubo
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
