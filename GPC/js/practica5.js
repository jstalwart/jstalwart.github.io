/**
 * practica3.js
 * Practica #3 GPC
 * 
 * @author <agarcuc@inf.upv.es>
 */

// Módulos necesarios

import * as THREE from "../lib/three.module.js"
import { GLTFLoader } from "../lib/GLTFLoader.module.js"
import { OrbitControls } from "../lib/OrbitControls.module.js"
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables estándar
let renderer, scene, camera;

// Otras globales
let robot, brazo, antebrazo, mano, dedoa, dedob;
let roboMaterial = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});
let speed= 0.1;

// Variables de la cámara
let controls;
let planta;
const L = 5; // lado menor de las vistas (la mitad)
let h;

//Variable controlador
let effectController;

// Materiales
let texsuelo = new THREE.TextureLoader().load("./images/pisometalico_1024.jpg");
let matsuelo = new THREE.MeshStandardMaterial({color:"white",
                                                map: texsuelo})
const entorno= ["./images/posx.jpg","./images/negx.jpg",
"./images/posy.jpg","./images/negy.jpg",
"./images/posz.jpg","./images/negz.jpg"];
let metal= new THREE.CubeTextureLoader().load(entorno);
let gold = new THREE.MeshPhongMaterial({color:"gold", specular:"yellow", shininess: 30, envMap: metal});
let silver = new THREE.MeshPhongMaterial({color:"silver", specular:"white", shininess: 30, envMap: metal});
let wood = new THREE.TextureLoader().load("./images/wood512.jpg")
let madera = new THREE.MeshLambertMaterial({map: wood, side:THREE.FrontSide})

init();
loadScene();
setupGUI();
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

    //Movement
    //renderer.domElement.addEventListener('keydown', move);
    //document.addEventListener('keydown', move);
    document.addEventListener("keydown", move, false);

    //Variables de luz
    const ambiental =new THREE.AmbientLight(0x222222);
    scene.add(ambiental);

    const direcional = new THREE.DirectionalLight(0xFFFFFF, 0.3);
    direcional.position.set(-1,1,-1);
    direcional.castShadow=true;
    scene.add(direcional);

    const puntual =new THREE.PointLight(0xFFFFFF,0.3);
    puntual.position.set(2,7,-4);
    scene.add(puntual);

    const focal =new THREE.SpotLight(0xFFFFFF);
    focal.position.set(-20,60,20);
    focal.target.position.set(0,10,0);
    focal.angle=Math.PI/7;
    focal.penumbra=0.3;
    focal.castShadow=true;
    scene.add(focal);
    
    renderer.shadowMap.enabled=true;
}

    function loadScene() {//habitacion
        const paredes=[];
        paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide, //hree.backside
            map:new THREE.TextureLoader().load("./images/posx.jpg")}));
        paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide, 
            map:new THREE.TextureLoader().load("./images/negx.jpg")}));
        paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide, 
            map:new THREE.TextureLoader().load("./images/posy.jpg")}));    
        paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide, 
            map:new THREE.TextureLoader().load("./images/negy.jpg")}));    
        paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide, 
            map:new THREE.TextureLoader().load("./images/posz.jpg")}));
        paredes.push(new THREE.MeshBasicMaterial({side:THREE.BackSide, 
            map:new THREE.TextureLoader().load("./images/negz.jpg")}));
    
    
        //geometria
        const geoHabitacion= new THREE.BoxGeometry(500,500,500);
        const habitacion= new THREE.Mesh(geoHabitacion,paredes);
        scene.add(habitacion)

    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(100, 100, 100, 100), matsuelo )
    suelo.rotation.x = -Math.PI/2
    suelo.position.y = -0.2
    suelo.receiveShadow=true
    scene.add( suelo )

    // Robot
    // Base
    robot = new THREE.Mesh( new THREE.CylinderGeometry(5, 5, 1.5, 36), madera)
    robot.receiveShadow=true
    robot.castShadow=true
    robot.position.x = 0
    robot.position.y = 0.75

    //Brazo
    const eje = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1.8, 36), gold)
    eje.receiveShadow=true
    eje.castShadow=true
    eje.position.y = 2
    eje.rotation.x = -Math.PI/2
    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(1.8, 12, 1.2), madera)
    esparrago.receiveShadow=true
    esparrago.castShadow=true
    esparrago.position.y = 8
    brazo = new THREE.Object3D()
    brazo.add(eje)
    brazo.add(esparrago)
    brazo.position.x = 0

    // Antebrazo
    antebrazo = new THREE.Object3D()
    const rotula = new THREE.Mesh(new THREE.SphereGeometry(2, 36, 36), gold)
    rotula.receiveShadow=true
    rotula.castShadow=true   
    antebrazo.add(rotula)
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.6, 36), silver)
    disco.receiveShadow=true
    disco.castShadow=true
    antebrazo.add(disco)
    const nervios = new THREE.Object3D()
    const nervio1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), silver)
    nervio1.receiveShadow=true
    nervio1.castShadow=true
    nervio1.position.x = 0.5
    nervio1.position.z = 0.5
    nervios.add(nervio1)
    const nervio2 = nervio1.clone()
    nervio2.position.x = 0.5
    nervio2.position.z = -0.5
    nervios.add(nervio2)
    const nervio3 = nervio1.clone()
    nervio3.position.x = -0.5
    nervio3.position.z = 0.5
    nervios.add(nervio3)
    const nervio4 = nervio1.clone()
    nervio4.position.x = -0.5
    nervio4.position.z = -0.5
    nervios.add(nervio4)
    nervios.position.y = 5.3
    antebrazo.add(nervios)
    /*const mano = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 36), roboMaterial)
    mano.rotation.x = Math.PI/2
    mano.position.y = 9.3*/

    // mano
    mano = new THREE.Object3D();
    const baseMano = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 36), madera)
    baseMano.receiveShadow=true
    baseMano.castShadow=true
    baseMano.rotation.x = Math.PI/2
    mano.add(baseMano)

    //pinza
    let pinza = new THREE.Object3D()
    //falange mayor
    const falange1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2, 0.4), madera)
    falange1.receiveShadow=true
    falange1.castShadow=true
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
    const falange2 = new THREE.Mesh(falange2_structure, madera)
    falange2.receiveShadow=true
    falange2.castShadow=true
    
    dedoa = new THREE.Object3D()
    dedoa.add( falange1)
    dedoa.add(falange2)
    dedoa.position.x = 2
    dedob = dedoa.clone()

    pinza.add(dedoa)
    pinza.add(dedob)
    pinza.position.y = -0.5
    pinza.position.z = -0.2

    mano.position.y = 8.5

    
    mano.add(pinza)
    antebrazo.add(mano)
    antebrazo.position.y = 15
    brazo.add(antebrazo)
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

function update()
    {

        // Lectura de controles en GUI (mejor hacerlo con onChange)
        robot.rotation.y = effectController.giroBase * Math.PI / 180;
        brazo.rotation.z = effectController.giroBrazo * Math.PI / 180;
        antebrazo.rotation.y = effectController.giroAntebrazo_Y * Math.PI / 180;
        antebrazo.rotation.z = effectController.giroAntebrazo_Z * Math.PI / 180;
        mano.rotation.z = effectController.rotacionPinza * Math.PI / 180;
        dedoa.position.z = -0.2-effectController.aperturaPinza/20;
        dedob.position.z = 0.2+ effectController.aperturaPinza/20;
        robot.material.wireframe = effectController.consistencia;
        gold.wireframe = effectController.consistencia;
        silver.wireframe = effectController.consistencia;
        matsuelo.wireframe = effectController.consistencia;
        speed = effectController.speed;

        TWEEN.update();
        /*cubo.position.set(-1-effectController.separacion/2,0,0);
        esfera.position.set(1+effectController.separacion/2,0,0);
        cubo.material.setValues( {color: effectController.colorsuelo} );
        esferaCubo.rotation.y = effectController.giroY * Math.PI / 180; // radianes
    */
    }

function render() {
    requestAnimationFrame(render);
    renderer.clear();
    update();
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
        planta.bottom = planta.bottom = -L;
        planta.top = planta.top = L;
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

function setupGUI(){
    // Definicion de controles
    effectController = {
        speed:1,
        giroBase: 0.0,
        giroBrazo: 0.0,
        giroAntebrazo_Y: 0.0,
        giroAntebrazo_Z: 0.0, 
        rotacionPinza: 0.0, 
        aperturaPinza: 15.0,
        consistencia: false, 
        animacion: animar
    };

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu
    h = gui.addFolder("Control robot");
    h.add(effectController, "speed", 0, 3).name("Velocidad de movimiento");
    h.add(effectController, "giroBase", -180.0, 180.0).name("Giro de la base (Y)").listen();
    h.add(effectController, "giroBrazo", -45.0, 45.0).name("Giro del brazo (Z)").listen();
    h.add(effectController, "giroAntebrazo_Y", -180.0, 180.0).name("Giro del antebrazo (Y)").listen();
    h.add(effectController, "giroAntebrazo_Z", -90.0, 90.0).name("Giro del antebrazo (Z)").listen();
    h.add(effectController, "rotacionPinza", -40.0, 220.0).name("Rotación de la pinza").listen();
    h.add(effectController, "aperturaPinza", 0.0, 15.0).name("Apertura de la pinza").listen();
    h.add(effectController, "consistencia").name("Alambre");
    h.add(effectController, "animacion").name("Animar");
}

// Acciones 
function move(){
    console.log("Tecla presionada:", event.keyCode);
    var keyCode = event.which;
    if (keyCode == 37) {
        robot.position.z -= speed;
    } else if (keyCode == 38) {
        robot.position.x += speed;
    } else if (keyCode == 39) {
        robot.position.z += speed;
    } else if (keyCode == 40) {
        robot.position.x -= speed;
    } else if (keyCode == 32) {
        robot.position.set(0, 0, 0);
    }
}

function animar(){
    new TWEEN.Tween(effectController).
    to({giroBase:[0, -90, -90, -90, -90, -90, 0, 0, 0, 0],
        giroBrazo: [0, 0, -30, -30, 0, 0, 0, -30, -30, 0],
        giroAntebrazo_Y: [-90, 0, 0, 0, 0, 90, 0, 0, 0, 0],
        giroAntebrazo_Z: [0, 0, -30, -30, 0, 0, 0, -30, -30, 0],
        rotacionPinza: [0, 0, 60, 60, 0, 0, 0, 60, 60, 0],
        aperturaPinza: [15, 15, 15, 0, 0, 0, 0, 0, 15, 15]}, 1500*7)
    .start()
}