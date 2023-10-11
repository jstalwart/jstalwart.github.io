// Módulos necesarios
import * as THREE from "/lib/three.module.js"
import { GLTFLoader } from "/lib/GLTFLoader.module.js"
import { OrbitControls } from "/lib/OrbitControls.module.js"

// Variables estándar
let renderer, scene, camera

// Otras globales
let esferaCubo
let angulo = 0;


let alzado, planta, perfil;
const L = 5; //lado menor de las vistas

// Funciones
function init() {
    // Instanciar el nodo raíz de la escena
    scene = new THREE.Scene();
    //scene.background = new THREE.Color( 0.5, 0.5, 0.5 );

    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer()
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.setClearColor(0xAAAAAA)
    renderer.autoClear = false
    document.getElementById( 'container' ).appendChild( renderer.domElement )

    

    // Instanciar la cámara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( 0.5, 2, 7 );
    camera.lookAt( 0, 20, 0 ) ;

    const controls = new OrbitControls(camera, renderer.domElement);

    // ar es aspect ratio
    const ar = window.innerWidth/window.innerHeight;
    setCameras(ar);
    window.addEventListener('resize', updateAspectRatio);
    renderer.domElement.addEventListener('dbclick', rotateShape)
}

function setCameras(ar) {
    let cameraOrto; 
    if (ar> 1)
        cameraOrto = new THREE.OrthographicCamera(-L*ar, L*ar, L, -L, -10, 100);
    else
        cameraOrto = new THREE.OrthographicCamera(-L, L, L/ar, -L/ar, -10, 100);

    alzado = cameraOrto.clone();
    alzado.position.set(0, 0, 10);
    alzado.lookAt(0, 0, 0);

    perfil = cameraOrto.clone();
    perfil.position.set(10, 0, 0);
    perfil.lookAt(0, 0, 0);

    planta = cameraOrto.clone();
    planta.position.set(0, 10, 0);
    planta.lookAt(0, 0, 0);
    planta.up = new THREE.Vector3(0, 0, -1);
}

function rotateShape(evento){
    letx = evento.clientX;
    let y = evento.clientY;

    let derecha=false, abajo=false;
    let cam = null;

    if (x > window.innerWidth/2) {
        derecha = true; 
        x -= window.innerWidth/2;
    }
    if (y > window.innerHeight/2){
        abajo = true; 
        y -= window.innerHeight/2;
    }
    if (derecha)
        if (abajo) cam = camera;
        else cam = perfil;
    else
        if (abajo) cam = planta;
        else cam = alzado;
    x = (x * 4/window.innerWidth) - 1;
    y = - (y*4/window.innerHeight) + 1; 
}

function updateAspectRatio(){
    // Cambia las dimensiones del canvas
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Nueva relación aspecto de la cámara
    const ar = window.innerWidth/window.innerHeight;

    //perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    //ortografica
    if (ar>1){
        alzado.left = planta.left = perfil.left = -L*ar
        alzado.right = planta.right = perfil.right = L*ar
        alzado.bottom = planta.bottom = perfil.bottom = -L
        alzado.top = planta.top = perfil.top = L
    }
    else {
        alzado.left = planta.left = perfil.left = -L
        alzado.right = planta.right = perfil.right = L
        alzado.bottom = planta.bottom = perfil.bottom = -L/ar
        alzado.top = planta.top = perfil.top = L/ar
    }
    alzado.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    planta.updateProjectionMatrix();
}



function loadScene() {
    // Material sencillo
    const material = new THREE.MeshBasicMaterial({ color:'yellow', wireframe:true });

    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry( 10, 10, 10, 10 ), material );
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    scene.add( suelo );

    // Esfera y cubo
    const esfera = new THREE.Mesh( new THREE.SphereGeometry( 1, 20, 20 ), material );
    const cubo = new THREE.Mesh( new THREE.BoxGeometry( 2, 2, 2 ), material );
    esfera.position.x = 1;
    cubo.position.x = -1;

    esferaCubo = new THREE.Object3D()
    esferaCubo.add( esfera )
    esferaCubo.add( cubo )
    esferaCubo.position.y = 1.5
    esferaCubo.name = "grupoEC";

    scene.add( esferaCubo )

    scene.add( new THREE.AxisHelper( 3 ) )
    cubo.add( new THREE.AxesHelper( 1 ) )

    // Modelos importados
    const loader = new THREE.ObjectLoader()
    loader.load( '../models/soldado/soldado.json', function(objeto) {
        cubo.add( objeto )
        objeto.position.y = 1
    })

    const glloader = new GLTFLoader()
    glloader.load( '../models/robota/scene.gltf', function(objeto) {
        esfera.add( objeto.scene )
        objeto.scene.scale.set( 0.5, 0.5, 0.5 )
        objeto.scene.position.y = 1
        objeto.scene.rotation.y = -Math.PI/2
        console.log( "ROBOT" )
        console.log( objeto )
    })
}

function update() {
    angulo += 0.01
    scene.rotation.y = angulo
}

function render() {
    requestAnimationFrame( render );
    //update()
    renderer.clear()
    let w = window.innerWidth/2;
    let h = window.innerHeight/2;
    renderer.setViewport(0, h, w, h);
    renderer.render( scene, alzado );
    renderer.setViewport(0, 0, w, h);
    renderer.render( scene, planta );
    renderer.setViewport(w, h, w, h);
    renderer.render( scene, perfil );
    renderer.setViewport(w, 0, w, h);
    renderer.render( scene, camera );
}

// Acciones
init()
loadScene()
render()