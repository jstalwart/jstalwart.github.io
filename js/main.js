// Módulos necesarios
import * as THREE from "/lib/three.module.js"
import { GLTFLoader } from "/lib/GLTFLoader.module.js"

// Variables estándar
let renderer, scene, camera

// Otras globales
let base
let brazo
let antebrazo
let pinza
let dedoa
let dedob
let angulo = 0

// Funciones
function init() {
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer()
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.getElementById( 'container' ).appendChild( renderer.domElement )

    // Instanciar el nodo raíz de la escena
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0.5, 0.5, 0.5 )

    // Instanciar la cámara
    camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1500)
    camera.position.set( 15, 10, 7 )
    camera.lookAt( 0, 10, 0 ) 
}

function loadScene() {
    // Material sencillo
    const material = new THREE.MeshBasicMaterial({ color : 0x220044})
    const roboMaterial = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe:true})

    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(500, 500, 1000, 1000), material )
    suelo.rotation.x = -Math.PI/2
    suelo.position.y = -0.2
    scene.add( suelo )

    // Robot
    // Base
    const base = new THREE.Mesh( new THREE.CylinderGeometry(5, 5, 1.5, 36), roboMaterial)
    base.position.x = 0
    base.position.y = 0.75
    scene.add(base)

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
        1, 2, 3, 
        4, 5, 6, 
        5, 6, 7, 
        0, 4, 6,  
        0, 2, 6, 
        0, 4, 5, 
        0, 1, 5,
        3, 5, 1, 
        3, 7, 5, 
        3, 7, 6, 
        3, 2, 6
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
    
    scene.add( brazo )
    scene.add( new THREE.AxisHelper( 3 ) )
}

function update() {
    angulo += 0.01
    scene.rotation.y = angulo
}

function render() {
    requestAnimationFrame( render )
    update()
    renderer.render( scene, camera )
}

// Acciones
init()
loadScene()
render()