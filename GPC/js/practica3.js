/**
 * practica3.js
 * Practica #3 GPC
 * 
 * @author <agarcuc@inf.upv.es>
 */

// Módulos necesarios

import * as THREE from "../lib/three.module.js"
import { GLTFLoader } from "../lib/GLTFLoader.module.js"
import { OrbitControls } from "../../lib/OrbitControls.module.js"

// Variables estándar
let renderer, scene, camera;

// Otras globales
let robot, brazo, antebrazo
let angulo= 0;

// Variables de la cámara
let controls;
let planta;
const L = 5; // lado menor de las vistas (la mitad)

// Acciones 
init();
loadScene();
render();

// Funciones
function init() {
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor(new THREE.Color(0.7,0.9,0.9));
    document.getElementById("container").appendChild(renderer.domElement);
    renderer.autoClear = false;

    // Instanciar el nodo raíz de la escena
    scene = new THREE.Scene();
    //scene.background = new THREE.Color( 0.5, 0.5, 0.5 )

    // Instanciar la cámara
    const ar = window.innerWidth/window.innerHeight;
    setCameras(ar);
    camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(16,23, 19);
    camera.lookAt(0, 9, 0);

    // Control de camara
    controls = new OrbitControls(camera, renderer.domElement);

    // Aspect ratio 
    window.addEventListener('resize', updateAspectRatio);
}

function loadScene() {
    // Material sencillo
    const material = new THREE.MeshBasicMaterial({ color : 0x220044})
    const roboMaterial = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false})

    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(500, 500, 1000, 1000), material )
    suelo.rotation.x = -Math.PI/2
    suelo.position.y = -0.2
    scene.add( suelo )

    // Robot
    robot = new THREE.Object3D()
    // Base
    const base = new THREE.Mesh( new THREE.CylinderGeometry(5, 5, 1.5, 36), roboMaterial)
    base.position.x = 0
    base.position.y = 0.75
    robot.add(base)

    //Brazo
    const eje = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1.8, 36), roboMaterial)
    eje.position.y = 2
    eje.rotation.x = -Math.PI/2
    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(1.8, 12, 1.2), roboMaterial)
    esparrago.position.y = 8
    const rotula = new THREE.Mesh(new THREE.SphereGeometry(2, 36, 36), roboMaterial)
    rotula.position.y = 14    
    brazo = new THREE.Object3D()
    brazo.add(eje)
    brazo.add(esparrago)
    brazo.add(rotula)
    brazo.position.x = 0

    // Antebrazo
    antebrazo = new THREE.Object3D()
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.6, 36), roboMaterial)
    antebrazo.add(disco)
    const nervios = new THREE.Object3D()
    const nervio1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), roboMaterial)
    nervio1.position.x = 0.5
    nervio1.position.z = 0.5
    nervios.add(nervio1)
    const nervio2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), roboMaterial)
    nervio2.position.x = 0.5
    nervio2.position.z = -0.5
    nervios.add(nervio2)
    const nervio3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), roboMaterial)
    nervio3.position.x = -0.5
    nervio3.position.z = 0.5
    nervios.add(nervio3)
    const nervio4 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), roboMaterial)
    nervio4.position.x = -0.5
    nervio4.position.z = -0.5
    nervios.add(nervio4)
    nervios.position.y = 4.3
    antebrazo.add(nervios)
    const mano = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 36), roboMaterial)
    mano.rotation.x = Math.PI/2
    mano.position.y = 8.3
    antebrazo.add(mano)
    antebrazo.position.y = 16
    brazo.add(antebrazo)

    //pinza
    let pinza = new THREE.Object3D()
    //falange mayor
    const falange1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2, 0.4), roboMaterial)
    falange1.position.x = -0.95
    falange1.position.y = 1
    falange1.position.z = 0.2
    // falange menor
    const falange2_structure = new THREE.BufferGeometry()
    const vertices = new Float32Array( [
        0, 2, 0, //v0
        1.9, 1.5, 0, //v1
        0, 0, 0, //v2
        1.9, 0.5, 0, //v3
        0, 2, 0.4, //v4
        1.9, 1.5, 0.4, //v5
        0, 0, 0.4, //v6
        1.9, 0.5, 0.4, //v7
    ]);

    const indices = [
        0, 1, 2,
        1, 3, 2, 
        5, 6, 7, 
        5, 4, 6, 
        0, 6, 4,  
        0, 2, 6, 
        0, 4, 5, 
        0, 5, 1,
        3, 1, 5, 
        3, 5, 7, 
        3, 7, 6, 
        3, 6, 2 
    ]
    falange2_structure.setIndex(indices)
    falange2_structure.setAttribute('position', new THREE.BufferAttribute( vertices, 3))
    const falange2 = new THREE.Mesh(falange2_structure, roboMaterial)
    
    let dedoa = new THREE.Object3D()
    dedoa.add( falange1)
    dedoa.add(falange2)
    dedoa.position.x = 2
    let dedob = dedoa.clone()

    dedoa.position.z = 1
    pinza.add(dedoa)
    dedob.position.z = -1.4
    pinza.add(dedob)

    pinza.position.y = 24
    brazo.add(pinza)
    robot.add(brazo)
    
    scene.add( robot )
    scene.add( new THREE.AxisHelper( 3 ) )
}

function setCameras(ar){
    // creacion de las camaras
    // ar -> aspect ratio (rel. de aspecto)
    let camaraOrtografica;
    if (ar>1)
        camaraOrtografica = new THREE.OrthographicCamera(-L*ar,L*ar, L,-L,-100,500);
    else
        camaraOrtografica = new THREE.OrthographicCamera(-L,L, L/ar,-L/ar,-100,500);
    
        planta = camaraOrtografica;
        planta.position.set(0,L,0);
        planta.lookAt(0,0,0);
        planta.up = new THREE.Vector3(0,100,-1);
    }

function update() {
    angulo += 0.01
    scene.rotation.y = angulo
}

function render() {
    requestAnimationFrame(render);
    renderer.clear();
    let w = window.innerWidth/4;
    let h = window.innerHeight/4;
    //Render la camara
    renderer.setViewport(0,0, window.innerWidth,window.innerHeight);
    renderer.render(scene, camera);
    // Render la planta
    renderer.setViewport(0,window.innerHeight-h, h,h);
    renderer.render(scene, planta);
}

function updateAspectRatio() {
    // Cada vez que se cambie el tamayo de la ventana, se llama a esta funcion
    // Cambiar las dimensiones del canvas
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Nuevo ar de la camara
    const ar = window.innerWidth/window.innerHeight;

    // perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    // ortografica
    // en funcion del ar, se cambia la camara
    if(ar > 1){
        planta.left = -L*ar;
        planta.right = L*ar;
        planta.bottom = perfil.bottom = -L;
        planta.top = perfil.top = L;
    }
    else {
        planta.left = -L;
        planta.right = L;
        planta.bottom = -L/ar;
        planta.top = L/ar;

    }

    // actualizar matrices de proyeccion
    planta.updateProjectionMatrix();
}