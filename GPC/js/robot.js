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
let robot;
let l_wheel1, l_wheel2, l_wheel3, l_wheel4, l_wheel5, r_wheel1, r_wheel2, r_wheel3, r_wheel4, r_wheel5;
let brazo, antebrazo, mano, dedoa, dedob;
let l_fingers, l_hand, l_forearm, l_arm;
let r_fingers, r_hand, r_forearm, r_arm;
let r_eye, l_eye, neck, head;
let speed= 0.1;

//Texturas
let texsuelo = new THREE.TextureLoader().load("./images/pisometalico_1024.jpg");
let matsuelo = new THREE.MeshStandardMaterial({color:"white",
                                                    map: texsuelo})
texsuelo.wrapS = texsuelo.wrapT = THREE.RepeatWrapping
let texparedes = new THREE.TextureLoader().load("./images/metal_128.jpg");
let paredes = new THREE.MeshStandardMaterial({color:"white",
                                                    map: texparedes})

// Variables de la cámara
let controls;
let planta;
const L = 5; // lado menor de las vistas (la mitad)
let h;

//Variable controlador
let effectController;

// Acciones 
function move(){
    console.log("Tecla presionada:", event.keyCode);
    var keyCode = event.which;
    if (keyCode == 32) {
        animate()
    }
    else if (keyCode == 37) {
        turn_left()
        l_wheel_spin_forward()
        r_wheel_spin_backward()
        //robot.position.z -= speed;
    } else if (keyCode == 38) {
        move_down()
        l_wheel_spin_backward()
        r_wheel_spin_backward()
    } else if (keyCode == 39) {
        turn_right()
        r_wheel_spin_forward()
        l_wheel_spin_backward()
    } else if (keyCode == 40) { 
        r_wheel_spin_forward()
        l_wheel_spin_forward()
        move_up()
    } else if (keyCode == 32) {
        robot.position.set(0, 0, 0);
    }
}

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
    scene.background = new THREE.Color( 0x000000)

    // Instanciar la cámara
    camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 0.1, 2000);
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

    //luces
    renderer.shadowMap.enabled=true;

}

function set_lights(scene){ 
    let light = new THREE.SpotLight(0xFFFFFF,0.3)
    light.angle = Math.PI/2.1

    //cabina
    const focal1 = light.clone();
    focal1.position.set(-80,50,0);
    focal1.target.position.set(-80,0,0);
    focal1.castShadow=true;
    scene.add(focal1);   
    scene.add(focal1.target)

    const focal2 = light.clone();
    focal2.position.set(0,50,0);
    focal2.castShadow=true;
    scene.add(focal2);   

    const focal3 = light.clone();
    focal3.position.set(100,40,0);
    focal3.target.position.set(100,0,0);
    focal3.castShadow=true;
    scene.add(focal3)
    scene.add(focal3.target); 

    // pasillo
    const pasillo1 = light.clone();
    pasillo1.position.set(0,40,80);
    pasillo1.target.position.set(0,0,80);
    pasillo1.castShadow=true;
    scene.add(pasillo1)
    scene.add(pasillo1.target)   

    const pasillo2 = light.clone();
    pasillo2.position.set(0,40,140);
    pasillo2.target.position.set(0,0,140);
    pasillo2.castShadow=true;
    scene.add(pasillo2);
    scene.add(pasillo2.target)

     //reactor
    let reactor_light1 = light.clone()
    reactor_light1.position.set(-80, 50, 330)
    reactor_light1.target.position.set(-80, 0, 330)
    reactor_light1.castShadow=true;
    reactor_light1.shadow.camera.far=500;
    reactor_light1.shadow.camera.fov=100;
    scene.add(reactor_light1)
    scene.add(reactor_light1.target)
    
    let reactor_light2 = reactor_light1.clone()
    reactor_light2.position.set(80, 50, 330)
    reactor_light2.target.position.set(80, 0, 330)
    reactor_light2.castShadow=true;
    reactor_light2.shadow.camera.far=2000;
    scene.add(reactor_light2)
    scene.add(reactor_light2.target)


    let reactor_light3 = reactor_light1.clone()
    reactor_light3.position.set(-80, 50, 400)
    reactor_light3.target.position.set(-80, 0, 400)
    reactor_light3.castShadow=true;
    reactor_light3.shadow.camera.far=2000;
    scene.add(reactor_light3)
    scene.add(reactor_light3.target)

    let reactor_light4 = reactor_light1.clone()
    reactor_light4.position.set(80, 50, 400)
    reactor_light4.target.position.set(80, 0, 400)
    reactor_light4.castShadow=true;
    reactor_light4.shadow.camera.far=2000;
    scene.add(reactor_light4)
    scene.add(reactor_light4.target)

    let reactor_light5 = reactor_light1.clone()
    reactor_light5.position.set(80, 50, 470)
    reactor_light5.target.position.set(80, 0, 470)
    reactor_light5.castShadow=true;
    reactor_light5.shadow.camera.far=2000;
    scene.add(reactor_light5)
    scene.add(reactor_light5.target)


    let reactor_light6 = reactor_light1.clone()
    reactor_light6.position.set(-80, 50, 470)
    reactor_light6.target.position.set(-80, 0, 470)
    reactor_light6.castShadow=true;
    reactor_light6.shadow.camera.far=2000;
    scene.add(reactor_light6)
    scene.add(reactor_light6.target)

    //scene.add(new THREE.CameraHelper(focal1.shadow.camera));//lineas de la luz
    return(scene)
}

function loadScene() {
    // Habitación  
    const texspace = new THREE.TextureLoader().load("./images/space.png")
    texspace.wrapS = texsuelo.wrapT = THREE.RepeatWrapping
    const cuarto = new THREE.MeshBasicMaterial({side:THREE.BackSide,
        map: texspace});

    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(1000, 1000, 1500), cuarto);
    scene.add(habitacion)    

    robot = create_robot()
    scene.add(robot)
    
    const starship = create_spaceship()
    scene.add(starship)
    //scene.add( new THREE.AxisHelper( 3 ) )
    
    scene = set_lights(scene)
    let light = new THREE.SpotLight(0xFFFFFF,0.3)
    light.angle = Math.PI/3
    light.position.y=30
}

function create_spaceship(){
    const starship = new THREE.Object3D()
    starship.add(create_cabina())
    const pasillo = create_pasillo()
    pasillo.position.z = 120
    starship.add(pasillo) 
    const reactor = create_reactor()
    reactor.position.z = 390
    starship.add(reactor)
    starship.recieveShadow = true
    starship.castShadow=true
    return(starship)

}

function create_cabina(){
    // Suelo
    const cabina = new THREE.Object3D()
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(200, 100, 1, 1), matsuelo )
    suelo.receiveShadow=true;
    suelo.rotation.x = -Math.PI/2
    suelo.position.y = 0
    suelo.receiveShadow = true;

    // Paredes
    const cristalera = new THREE.MeshPhongMaterial({color:"black", specular:"lightblue", shininess: 30, envMap: paredes, transparent:true, opacity:0.1})
    //Cristalera
    const pared1 = new THREE.Mesh(new THREE.BoxGeometry(200, 25, 2), cristalera)
    pared1.position.z = -50
    pared1.position.y = 27.5
    cabina.add(pared1)
    const pared2 = new THREE.Mesh(new THREE.BoxGeometry(2, 25, 100), cristalera)
    pared2.position.x = -100
    pared2.position.y = 27.5
    cabina.add(pared2)
    const pared5 = pared2.clone()
    pared5.position.x = 100
    cabina.add(pared5)
    //Columnas
    const columna1 = new THREE.Mesh(new THREE.BoxGeometry(2, 50, 2), paredes)
    columna1.castShadow=true;
    columna1.receiveShadow = true;
    columna1.position.x = 100
    columna1.position.y = 25
    columna1.position.z = -50
    cabina.add(columna1)
    const columna2 = columna1.clone()
    columna2.position.x = -100
    cabina.add(columna2)
    //Falso techo
    const falso_techo1 = new THREE.Mesh(new THREE.BoxGeometry(200, 10, 2), paredes)
    falso_techo1.position.z = -50
    falso_techo1.position.y = 45
    falso_techo1.castShadow=true;
    falso_techo1.receiveShadow = true;
    cabina.add(falso_techo1)
    const falso_techo2 = new THREE.Mesh(new THREE.BoxGeometry(2, 10, 100), paredes)
    falso_techo2.position.x = -100
    falso_techo2.position.y = 45
    falso_techo2.castShadow=true;
    falso_techo2.receiveShadow = true;
    cabina.add((falso_techo2))
    const falso_techo3 = falso_techo2.clone()
    falso_techo3.position.x = 100
    cabina.add(falso_techo3)
    //Falso suelo
    const falso_suelo1 = new THREE.Mesh(new THREE.BoxGeometry(200, 15, 2), paredes)
    falso_suelo1.position.z = -50
    falso_suelo1.position.y = 7.5
    falso_suelo1.castShadow=true;
    falso_suelo1.receiveShadow = true;
    cabina.add(falso_suelo1)
    const falso_suelo2 = new THREE.Mesh(new THREE.BoxGeometry(2, 15, 100), paredes)
    falso_suelo2.castShadow=true;
    falso_suelo2.receiveShadow = true;
    falso_suelo2.position.x = -100
    falso_suelo2.position.y = 7.5
    cabina.add((falso_suelo2))
    const falso_suelo3 = falso_suelo2.clone()
    falso_suelo3.position.x = 100
    cabina.add(falso_suelo3)
    //Paredes
    const pared3 = new THREE.Mesh(new THREE.BoxGeometry(80, 50, 2), paredes)
    pared3.castShadow=true;
    pared3.receiveShadow = true;
    pared3.position.x = -60 
    pared3.position.z = 50
    pared3.position.y = 25
    cabina.add(pared3)
    const pared4 = pared3.clone()
    pared4.position.x = 60
    cabina.add(pared4)

    //Objetos

    //Timón
    const rudder = new THREE.Mesh( new THREE.SphereGeometry( .1, 20, 20 ), matsuelo );
    const glloader = new GLTFLoader()
    glloader.load( './models/rudder/scene.gltf', function(objeto) {
        rudder.add( objeto.scene )
        objeto.scene.scale.set( 0.2, 0.2, 0.2 )
        objeto.scene.position.y = 1
        objeto.scene.rotation.y = -Math.PI/2
        console.log( "rudder" )
        console.log( objeto )
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
    })
    rudder.position.z = -42;
    rudder.castShadow=true;

    //Panel de control
    let tex_pannel = new THREE.TextureLoader().load("./images/mandos.png");
    let mat_pannel = new THREE.MeshStandardMaterial({color:"white",
                                                    map: tex_pannel})

    const metal_tex = new THREE.TextureLoader().load("./images/metal_128.jpg");
    const metal = new THREE.MeshStandardMaterial({color:"grey", map: metal_tex})
    const plane_pannel = new THREE.Mesh( new THREE.PlaneGeometry(20, 40, 20, 20), mat_pannel )
    plane_pannel.rotation.x = -Math.PI/2
    plane_pannel.position.y = .6
    const control_panel_left = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 100), metal)
    const plane_pannel1 = plane_pannel.clone()
    const plane_pannel2 = plane_pannel.clone()
    plane_pannel1.position.z = -10
    plane_pannel2.position.z = 30
    control_panel_left.add(plane_pannel1)
    control_panel_left.add(plane_pannel2)
    control_panel_left.castShadow=true;
    plane_pannel.receive_shadow = true;
    control_panel_left.position.x = -90
    control_panel_left.position.y = 9.5
    control_panel_left.castShadow = true
    cabina.add(control_panel_left)

    const control_panel_right = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 100), metal)
    const plane_pannel3 = plane_pannel.clone()
    const plane_pannel4 = plane_pannel.clone()
    plane_pannel3.position.z = 10
    plane_pannel4.position.z = -30
    control_panel_right.add(plane_pannel3)
    control_panel_right.add(plane_pannel4)
    control_panel_right.castShadow=true;
    plane_pannel.receive_shadow = true;
    control_panel_right.position.y = 9.5    
    control_panel_right.position.x = 90
    control_panel_right.rotation.y = Math.PI
    control_panel_right.castShadow = true
    cabina.add(control_panel_right)
    
    const controlPanel_lc = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 80), metal)
    const plane_pannel5 = plane_pannel.clone()
    const plane_pannel6 = plane_pannel.clone()
    plane_pannel5.position.z = 20
    plane_pannel6.position.z = -20
    controlPanel_lc.add(plane_pannel5)
    controlPanel_lc.add(plane_pannel6)
    controlPanel_lc.position.x = 50
    controlPanel_lc.position.y = 9.5 
    controlPanel_lc.position.z = -40
    controlPanel_lc.rotation.y = Math.PI/2
    controlPanel_lc.castShadow = true
    cabina.add(controlPanel_lc)

    const controlPanel_rc = controlPanel_lc.clone()
    controlPanel_rc.position.x = -50
    cabina.add(controlPanel_rc)

    cabina.add(suelo);
    cabina.add(rudder)

    return(cabina)
}

function create_pasillo(){
    const sala = new THREE.Object3D()

    //Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(100, 140, 200, 140), matsuelo )
    suelo.rotation.x = -Math.PI/2
    suelo.position.y = 0
    suelo.receiveShadow = true;
    sala.add(suelo)

    //Shields
    const pared1 = new THREE.Mesh(new THREE.BoxGeometry(5, 50, 140), paredes)
    pared1.position.x = -50
    pared1.position.y = 25

    const loader_shields = new GLTFLoader()
    loader_shields.load( './models/sci_fi_antenna/scene.gltf', function(objeto) {
        pared1.add( objeto.scene )
        objeto.scene.scale.set( 25 , 25, 25 )
        objeto.scene.position.x = -2.5
        objeto.scene.rotation.z = Math.PI/2
        console.log( "shields" )
        console.log( objeto )
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
    })
    
    pared1.receiveShadow = true;
    pared1.castShadow = true
    sala.add(pared1)

    //Guns
    const pared2 = pared1.clone()
    pared2.position.x = 50

    const loader_guns = new GLTFLoader()
    loader_guns.load( './models/scifi_spaceship_star_gun/scene.gltf', function(objeto) {
        pared2.add( objeto.scene )
        objeto.scene.scale.set( 4 , 4, 4 )
        objeto.scene.position.x = 95
        objeto.scene.position.y = 0
        objeto.scene.position.z = -30
        objeto.scene.rotation.y = -Math.PI
        objeto.scene.rotation.z = -Math.PI/2
        console.log( "guns" )
        console.log( objeto )
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
    })
    pared2.receiveShadow = true;
    pared2.castShadow = true
    sala.add(pared2)

    //Paneles
    let tex_pannel = new THREE.TextureLoader().load("./images/mandos.png");
    let mat_pannel = new THREE.MeshStandardMaterial({color:"white",
                                                    map: tex_pannel})
    const plane_pannel = new THREE.Mesh( new THREE.PlaneGeometry(20, 40, 20, 20), mat_pannel )
    plane_pannel.rotation.x = -Math.PI/2
    plane_pannel.position.y = .6
    const metal_tex = new THREE.TextureLoader().load("./images/metal_128.jpg");
    const metal = new THREE.MeshStandardMaterial({color:"grey", map: metal_tex})    
    const controlPanel_l = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 120), metal)
    const plane_pannel1 = plane_pannel.clone()
    const plane_pannel2 = plane_pannel.clone()
    const plane_pannel3 = plane_pannel.clone()
    plane_pannel1.position.z = -40
    plane_pannel2.position.z = 0
    plane_pannel3.position.z = 40
    controlPanel_l.add(plane_pannel1)
    controlPanel_l.add(plane_pannel2)
    controlPanel_l.add(plane_pannel3)
    controlPanel_l.position.x = -40
    controlPanel_l.position.y = 9.5 
    sala.add(controlPanel_l)
    const control_pannel_r = controlPanel_l.clone()
    control_pannel_r.rotation.y = Math.PI
    control_pannel_r.position.x = 40
    sala.add(control_pannel_r)

    //Screens
    let screen_tex = new THREE.TextureLoader().load("./images/hud.png");
    let mat_screen = new THREE.MeshStandardMaterial({color:"white",
                                                    map: screen_tex})
    const screen = new THREE.Mesh( new THREE.PlaneGeometry(20, 13, 20, 20), mat_screen)
    const screens_l = screen.clone()
     screen.position.x=-20
    screens_l.add(screen.clone()) 
    screen.position.x=-40
    screens_l.add(screen.clone()) 
     screen.position.x=20
    screens_l.add(screen.clone())
    screen.position.x=40
    screens_l.add(screen.clone())
    screens_l.position.y= 20
    screens_l.rotation.y = Math.PI/2
    screens_l.position.x = -47
    sala.add(screens_l)

    const screens_r = screens_l.clone()
    screens_r.rotation.y = -Math.PI/2
    screens_r.position.x = 47   
    sala.add(screens_r)


    return(sala)
}

function create_reactor(){
    const sala = new THREE.Object3D()
    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(400, 400, 400, 400), matsuelo )
    suelo.rotation.x = -Math.PI/2
    suelo.position.y = 0
    suelo.receiveShadow = true;
    sala.add(suelo)

    //Paredes
    const pared1 = new THREE.Mesh(new THREE.BoxGeometry(180, 50, 2), paredes)
    pared1.castShadow=true
    pared1.receiveShadow=true
    pared1.position.z = -200
    pared1.position.x = -110
    pared1.position.y = 25
    sala.add(pared1)

    const pared2 = new THREE.Mesh(new THREE.BoxGeometry(2, 50, 400), paredes)
    pared2.castShadow=true
    pared2.receiveShadow=true
    pared2.position.x = -200
    pared2.position.y = 25
    sala.add(pared2)

    const pared3 = pared1.clone()
    pared3.position.x = 110
    sala.add(pared3)

    const pared4 = pared2.clone()
    pared4.position.x = 200
    sala.add(pared4)

    //Objetos
    //Reactor
    const reactor = new THREE.Mesh( new THREE.SphereGeometry( .1, 20, 20 ), paredes );
    const glloader = new GLTFLoader()
    glloader.load( './models/scifi_reactor_core/scene.gltf', function(objeto) {
        reactor.add( objeto.scene )
        objeto.scene.scale.set( 20, 20, 20 )
        objeto.scene.position.y = 0
        objeto.scene.rotation.y = -Math.PI/2
        console.log( "reactor" )
        console.log( objeto )
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
    })
    reactor.rotation.y = Math.PI
    reactor.position.z = -50

    const metal_tex = new THREE.TextureLoader().load("./images/metal_128.jpg");
    const metal = new THREE.MeshStandardMaterial({color:"grey", map: metal_tex})
    const control_reactor = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), metal)
    const contr_Reactor_loader = new GLTFLoader()
    contr_Reactor_loader.load( './models/sci_fi_panel_control/scene.gltf', function(objeto) {
        control_reactor.add( objeto.scene )
        objeto.scene.scale.set( 75, 75, 75 )
        objeto.scene.position.y = 3.5
        console.log( "control_reactor" )
        console.log( objeto )
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
    })

    control_reactor.position.z = 50
    control_reactor.position.y = 5
    reactor.add(control_reactor)
    reactor.castShadow=true


    sala.add(reactor)

     //Motores
    //Derecho
    const r_engine = new THREE.Mesh( new THREE.SphereGeometry( .1, 20, 20 ), matsuelo );
    const glloader2 = new GLTFLoader()
    glloader2.load( './models/engine/scene.gltf', function(objeto) {
        r_engine.add( objeto.scene )
        objeto.scene.scale.set( 50, 50, 50 )
        objeto.scene.position.y = 25
        objeto.scene.rotation.y = -Math.PI/2
        console.log( "r_engine" )
        console.log( objeto )
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
    })
    r_engine.position.x = 110
    r_engine.position.y = 10
    r_engine.position.z = 130
    r_engine.castShadow=true
    sala.add(r_engine)

    //Izquierdo
    const l_engine = new THREE.Mesh( new THREE.SphereGeometry( .1, 20, 20 ), matsuelo );
    const glloader3 = new GLTFLoader()
    glloader3.load( './models/engine/scene.gltf', function(objeto) {
        l_engine.add( objeto.scene )
        objeto.scene.scale.set( 50, 50, 50 )
        objeto.scene.position.y = 25
        objeto.scene.rotation.y = -Math.PI/2
        console.log( "l_engine" )
        console.log( objeto )
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
    })
    l_engine.position.x = -110
    l_engine.position.y = 10
    l_engine.position.z = 130
    l_engine.castShadow=true
    sala.add(l_engine)

    //Izquierdo
    const engine = new THREE.Mesh( new THREE.SphereGeometry( .1, 20, 20 ), matsuelo );
    const glloader4 = new GLTFLoader()
    glloader4.load( './models/engine/scene.gltf', function(objeto) {
        engine.add( objeto.scene )
        objeto.scene.scale.set( 50, 50, 50 )
        objeto.scene.position.y = 25
        objeto.scene.rotation.y = -Math.PI/2
        console.log( "engine" )
        console.log( objeto )
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
    })
    engine.position.x = 0
    engine.position.y = 10
    engine.position.z = 130
    engine.castShadow=true
    sala.add(engine)

    const boxes1 = put_line_boxes()
    boxes1.position.z=-140
    boxes1.position.x = -140 
    sala.add(boxes1)

    const boxes2 = put_box_pile()
    boxes2.position.z=-180
    boxes2.position.x = -180
    sala.add(boxes2)

    const boxes3 = put_box_pile()
    boxes3.position.z=-100
    boxes3.position.x = -180
    sala.add(boxes3)

    const boxes4 = put_line_boxes()
    boxes4.position.z=-140
    boxes4.position.x = -90 
    boxes4.rotation.y = Math.PI
    sala.add(boxes4)

    const boxes5 = put_line_boxes()
    boxes5.position.z=-140
    boxes5.position.x = 180 
    sala.add(boxes5)

    const boxes6 = put_box_pile()
    boxes6.position.z=-180
    boxes6.position.x = 180
    sala.add(boxes6)

    const boxes7 = put_box_pile()
    boxes7.position.z=-100
    boxes7.position.x = 90
    sala.add(boxes7)

    const boxes8 = put_line_boxes()
    boxes8.position.z=-140
    boxes8.position.x = 140 
    boxes8.rotation.y = Math.PI
    sala.add(boxes8)

    sala.castShadow = true
    sala.receiveShadow = true

    return(sala)

}

function put_line_boxes(){
    const sala = new THREE.Object3D()
    const wood_tex = new THREE.TextureLoader().load("./images/wood512.jpg");
    const wood = new THREE.MeshStandardMaterial({color:"blue",
                                                map: wood_tex})
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), wood)  
    box.castShadow=box.receiveShadow=true  
    const box1 = box.clone()
    box1.position.x=-5
    box1.position.y=5
    box1.position.z=-5
    sala.add(box1)

    const box2 = box.clone()
    box2.position.x=5
    box2.position.y = 5
    box2.position.z=-5
    sala.add(box2)

    const box3 = box.clone()
    box3.position.x=-15
    box3.position.y=5
    box3.position.z=5
    sala.add(box3)

    const box4 = box.clone()
    box4.position.x=-15
    box4.position.y=5
    box4.position.z=-5
    sala.add(box4)

    const box5 = box.clone()
    box5.position.x=-5
    box5.position.y=5
    box5.position.z=-15
    sala.add(box5)

    const box6 = box.clone()
    box6.position.x=-5
    box6.position.y=5
    box6.position.z=5
    sala.add(box6)

    const box7 = box.clone()
    box7.position.x=-5
    box7.position.y=15
    box7.position.z=-5
    sala.add(box7)

    const box8 = box.clone()
    box8.position.x=5
    box8.position.y=5
    box8.position.z=5
    sala.add(box8)

    const box9 = box.clone()
    box9.position.x=5
    box9.position.y=5
    box9.position.z=15
    sala.add(box9)

    const box10 = box.clone()
    box10.position.x=-5
    box10.position.y=5
    box10.position.z=15
    sala.add(box10)

    const box11 = box.clone()
    box11.position.x=-15
    box11.position.y=5
    box11.position.z=15
    sala.add(box11)

    const box12 = box.clone()
    box12.position.x=-5
    box12.position.y=5
    box12.position.z=25
    sala.add(box12)

    const box13 = box.clone()
    box13.position.x=-5
    box13.position.y=15
    box13.position.z=15
    sala.add(box13)

    const box14 = box.clone()
    box14.position.x=-5
    box14.position.y=15
    box14.position.z=5
    sala.add(box14)

    const box15 = box.clone()
    box15.position.x=5
    box15.position.y=15
    box15.position.z=5
    sala.add(box15)

    const box16 = box.clone()
    box16.position.x=25
    box16.position.y=5
    box16.position.z=25
    sala.add(box16)

    sala.receiveShadow=true
    sala.castShadow = true

    return(sala)
}

function put_box_pile(){
    const sala = new THREE.Object3D()
    const wood_tex = new THREE.TextureLoader().load("./images/wood512.jpg");
    const wood = new THREE.MeshStandardMaterial({color:"blue",
                                                map: wood_tex})
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), wood) 
    box.castShadow=box.receiveShadow=true     
    const box1 = box.clone()
    box1.position.x=-5
    box1.position.y=5
    box1.position.z=-5
    sala.add(box1)

    const box2 = box.clone()
    box2.position.x=5
    box2.position.y = 5
    box2.position.z=-5
    sala.add(box2)

    const box3 = box.clone()
    box3.position.x=15
    box3.position.y=5
    box3.position.z=15
    sala.add(box3)

    const box4 = box.clone()
    box4.position.x=-15
    box4.position.y=5
    box4.position.z=-5
    sala.add(box4)

    const box5 = box.clone()
    box5.position.x=-5
    box5.position.y=5
    box5.position.z=-15
    sala.add(box5)

    const box6 = box.clone()
    box6.position.x=-5
    box6.position.y=5
    box6.position.z=5
    sala.add(box6)

    const box7 = box.clone()
    box7.position.x=-5
    box7.position.y=15
    box7.position.z=-5
    sala.add(box7)

    return(sala)
}

function create_robot(){
    // Robot
    let metalic = new THREE.TextureLoader().load("./images/metal_128.jpg");
    const gome = new THREE.TextureLoader().load("./images/goma.png")
    const goma = new THREE.MeshStandardMaterial({color:"black", map: gome})
    const wood = new THREE.TextureLoader().load("./images/wood512.jpg")
    const madera = new THREE.MeshStandardMaterial({map: wood})
    const gold = new THREE.MeshStandardMaterial({color:"gold", map: metalic});//brillos
    const silver = new THREE.MeshStandardMaterial({color:"silver", map: metalic});//brillos
    
    robot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 15), silver)
    robot.castShadow = true
    robot.receiveShadow = true
    const eix0 = robot.clone()
    eix0.position.x = 3
    const eix1 = eix0.clone()
    eix1.position.x = -3
    robot.add(eix0)
    robot.add(eix1)

    //Pierna izquierda
    const l_wheel = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 36), goma)
    l_wheel.castShadow = true
    l_wheel.receiveShadow = true
    l_wheel.position.y = -.5;
    const l_leg = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 0.5), silver)
    l_leg.castShadow = true
    l_leg.receiveShadow = true
    const eje1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 36), silver)
    eje1.castShadow = true
    eje1.receiveShadow = true   
    eje1.rotation.x = -Math.PI/2
    l_wheel1 = eje1.clone()
    l_wheel2 = l_wheel1.clone()
    l_wheel3 = l_wheel1.clone()
    l_wheel4 = l_wheel1.clone()
    l_wheel5 = l_wheel1.clone()
    l_wheel1.position.z = 0.5
    l_wheel1.position.x = 2
    l_wheel1.add(l_wheel)
    l_leg.add(l_wheel1)
    l_wheel2.position.z = .5
    l_wheel2.add(l_wheel.clone())
    l_leg.add(l_wheel2)
    l_wheel3.position.z = .5
    l_wheel3.position.x = -2
    l_wheel3.add(l_wheel.clone())
    l_leg.add(l_wheel3)
    l_wheel4.position.z = .5
    l_wheel4.position.x = -4
    l_wheel4.add(l_wheel.clone())
    l_leg.add(l_wheel4)
    l_wheel5.position.z = .5
    l_wheel5.position.x = 4
    l_wheel5.add(l_wheel.clone())
    l_leg.add(l_wheel5)
    l_leg.position.z = 7.5
    robot.add(l_leg)

    //Pierna derecha
    const r_wheel = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 36), goma)
    r_wheel.position.y = -.5;
    r_wheel.castShadow = true
    r_wheel.receiveShadow = true
    const r_leg = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 0.5), silver)
    r_leg.castShadow = true
    r_leg.receiveShadow = true
    const eje2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 36), silver)   
    eje2.castShadow = true
    eje2.receiveShadow = true
    eje2.rotation.x = -Math.PI/2
    r_wheel1 = eje2.clone()
    r_wheel2 = r_wheel1.clone()
    r_wheel3 = r_wheel1.clone()
    r_wheel4 = r_wheel1.clone()
    r_wheel5 = r_wheel1.clone()
    r_wheel1.position.z = 0.5
    r_wheel1.position.x = 2
    r_wheel1.add(r_wheel)
    r_leg.add(r_wheel1)
    r_wheel2.position.z = .5
    r_wheel2.add(r_wheel.clone())
    r_leg.add(r_wheel2)
    r_wheel3.position.z = .5
    r_wheel3.position.x = -2
    r_wheel3.add(r_wheel.clone())
    r_leg.add(r_wheel3)
    r_wheel4.position.z = .5
    r_wheel4.position.x = -4
    r_wheel4.add(r_wheel.clone())
    r_leg.add(r_wheel4)
    r_wheel5.position.z = .5
    r_wheel5.position.x = 4
    r_wheel5.add(r_wheel.clone())
    r_leg.add(r_wheel5)
    r_leg.rotation.x = Math.PI
    r_leg.position.z = -7.5

    // Piernas
    robot.add(r_leg)
    const eje_sup = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, .5), silver);
    eje_sup.castShadow = true
    eje_sup.receiveShadow = true
    eje_sup.position.y = .5
    robot.add(eje_sup.clone())
    eje_sup.position.z = -5 
    eje_sup.position.x = 3
    robot.add(eje_sup.clone())
    eje_sup.position.z = 5 
    eje_sup.position.x = 3
    robot.add(eje_sup.clone())
    eje_sup.position.z = -5 
    eje_sup.position.x = -3
    robot.add(eje_sup.clone())
    eje_sup.position.z = 5 
    eje_sup.position.x = -3
    robot.add(eje_sup.clone())
    //eje_sup.position

    //Brazo
    brazo = new THREE.Mesh(new THREE.SphereGeometry(2.5, 36, 36), gold)
    brazo.castShadow = true
    brazo.receiveShadow = true
    brazo.position.y = 2.5
    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(1.8, 12, 1.2), madera)
    esparrago.castShadow = true
    esparrago.receiveShadow = true
    esparrago.position.y = 8
    brazo.add(esparrago)
    brazo.position.x = 0
    l_arm = brazo.clone()
    r_arm = brazo.clone()

    // Antebrazo
    antebrazo = new THREE.Object3D()
    antebrazo.castShadow = true
    antebrazo.receiveShadow = true
    const rotula = new THREE.Mesh(new THREE.SphereGeometry(2, 36, 36), gold)
    rotula.castShadow = true
    rotula.receiveShadow = true
    rotula.rotation.x = -Math.PI/2
    antebrazo.add(rotula)
    const nervios = new THREE.Object3D()
    nervios.castShadow = true
    nervios.receiveShadow = true
    const nervio1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), silver)
    nervio1.castShadow = true
    nervio1.receiveShadow = true
    nervio1.position.x = 0.5    
    nervio1.position.z = 0.5
    nervios.add(nervio1)
    const nervio2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), silver)
    nervio2.castShadow = true
    nervio2.receiveShadow = true
    nervio2.position.x = 0.5
    nervio2.position.z = -0.5
    nervios.add(nervio2)
    const nervio3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), silver)
    nervio3.castShadow = true
    nervio3.receiveShadow = true
    nervio3.position.x = -0.5
    nervio3.position.z = 0.5
    nervios.add(nervio3)
    const nervio4 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), silver)
    nervio4.castShadow = true
    nervio4.receiveShadow = true
    nervio4.position.x = -0.5
    nervio4.position.z = -0.5
    nervios.add(nervio4)
    nervios.position.y = 5.3
    antebrazo.add(nervios)
    r_forearm = antebrazo.clone()
    l_forearm = antebrazo.clone()
    /*const mano = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 36), roboMaterial)
    mano.rotation.x = Math.PI/2
    mano.position.y = 9.3*/

    // mano
    mano = new THREE.Object3D();
    mano.castShadow = true
    mano.receiveShadow = true
    const baseMano = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 36), madera)
    baseMano.castShadow = true
    baseMano.receiveShadow = true
    baseMano.rotation.x = Math.PI/2
    mano.add(baseMano)
    mano.position.y = 8.5
    r_hand = mano.clone()
    l_hand = mano.clone()

    //pinza
    let pinza = new THREE.Object3D()
    pinza.castShadow = true
    pinza.receiveShadow = true
    //falange mayor
    const falange1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2, 0.4), madera)
    falange1.castShadow = true
    falange1.receiveShadow = true
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
    falange2.castShadow = true
    falange2.receiveShadow = true
    
    dedoa = new THREE.Object3D()
    dedoa.castShadow = true
    dedoa.receiveShadow = true
    dedoa.add( falange1)
    dedoa.add(falange2)
    dedoa.position.x = 2
    dedob = dedoa.clone()
    dedoa.position.z = 0.2+15/20
    dedob.position.z = -0.2-15/20

    pinza.add(dedoa)
    pinza.add(dedob)
    pinza.position.y = -0.5
    pinza.position.z = -0.2

    l_fingers = pinza.clone()
    r_fingers = pinza.clone()

    mano.add(pinza)
    l_hand.add(l_fingers)
    r_hand.add(r_fingers)

    antebrazo.add(mano)
    l_forearm.add(l_hand);
    r_forearm.add(r_hand);
    l_forearm.position.y = r_forearm.position.y = antebrazo.position.y = 15;

    l_arm.add(l_forearm)
    r_arm.add(r_forearm)
    r_arm.rotation.x = 90*Math.PI/180
    l_arm.rotation.x = -90*Math.PI/180
    brazo.add(antebrazo)

    //Head

    neck = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), silver)
    neck.castShadow = true
    neck.receiveShadow = true
    neck.position.y = 2
    const neck2 = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 4), silver)
    neck2.castShadow = true
    neck2.receiveShadow = true
    neck2.position.y = 2.7
    //neck.add(neck2)
    head = new THREE.Mesh(new THREE.SphereGeometry(Math.sqrt(8), 36, 36), silver);
    head.castShadow = true
    head.receiveShadow = true
    head.position.y = 3.7
    r_eye = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 8, 36), gold)
    r_eye.castShadow = true
    r_eye.receiveShadow = true
    r_eye.rotation.x = Math.PI/2
    r_eye.position.z = -2
    r_eye.position.y = 3.05
    l_eye = r_eye.clone()
    r_eye.position.x = -2
    l_eye.position.x = 2
    head.add(r_eye)
    head.add(l_eye)
    neck2.add(head)
    neck2.rotation.x = 45*Math.PI/180
    head.rotation.x = -45*Math.PI/180
    neck2.position.z = 1.5
    neck.add(neck2)
    neck.position.y = 6
    neck.rotation.y = -Math.PI/2

    // Body
    //Cuerpo
    const body = new THREE.Mesh(new THREE.BoxGeometry(10, 15, 15), madera)
    body.castShadow = true
    body.receiveShadow = true
    body.position.y = 8.5
    l_arm.position.y = 7.5
    l_arm.position.z = -7.5
    r_arm.position.y = 7.5
    r_arm.position.z = 7.5
    l_arm.rotation.x = -Math.PI*150/180
    l_arm.rotation.z = -20*Math.PI/180
    l_forearm.rotation.z = -Math.PI/2
    l_hand.rotation.y = Math.PI/2
    r_arm.rotation.x = Math.PI*150/180
    r_arm.rotation.z = -20*Math.PI/180
    r_forearm.rotation.z = -Math.PI/2
    r_hand.rotation.y = -Math.PI/2

    //r_
    body.add(l_arm)
    body.add(r_arm)
    body.add(neck)

    robot.add(body)
    robot.position.y +=1
    return robot
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function animar(){
    new TWEEN.Tween(effectController).
    to({giroBase:[0, -90, -90, -90, -90, -90, 0, 0, 0, 0],
        giroBrazo: [0, 0, -30, -30, 0, 0, 0, -30, -30, 0],
        giroAntebrazo_Z: [0, 0, -30, -30, 0, 0, 0, -30, -30, 0],
        rotacionPinza: [0, 0, 60, 60, 0, 0, 0, 60, 60, 0],
        aperturaPinza: [15, 15, 15, 0, 0, 0, 0, 0, 15, 15]}, 1500*7)
    .start()
}

function turn_left(){
    new TWEEN.Tween(robot.rotation).
    to({x:[0], y:[-Math.PI], z:[0]}, 1000)
    .start()
}

function turn_right(){
    new TWEEN.Tween(robot.rotation).
    to({x:[0], y:[0], z:[0]})
    .start()
}

function l_wheel_spin_forward(){
    new TWEEN.Tween(l_wheel1.rotation)
    .to({y:l_wheel1.rotation.y+speed}, 1000)
    .start()
    new TWEEN.Tween(l_wheel2.rotation)
    .to({y:l_wheel2.rotation.y+speed}, 1000)
    .start()
    new TWEEN.Tween(l_wheel3.rotation)
    .to({y:l_wheel3.rotation.y+speed}, 1000)
    .start()
    new TWEEN.Tween(l_wheel4.rotation)
    .to({y:l_wheel4.rotation.y+speed}, 1000)
    .start()
    new TWEEN.Tween(l_wheel5.rotation)
    .to({y:l_wheel5.rotation.y+speed}, 1000)
    .start()
}

function l_wheel_spin_backward(){
    new TWEEN.Tween(l_wheel1.rotation)
    .to({y:l_wheel1.rotation.y-speed}, 1000)
    .start()
    new TWEEN.Tween(l_wheel2.rotation)
    .to({y:l_wheel2.rotation.y-speed}, 1000)
    .start()
    new TWEEN.Tween(l_wheel3.rotation)
    .to({y:l_wheel3.rotation.y-speed}, 1000)
    .start()
    new TWEEN.Tween(l_wheel4.rotation)
    .to({y:l_wheel4.rotation.y-speed}, 1000)
    .start()
    new TWEEN.Tween(l_wheel5.rotation)
    .to({y:l_wheel5.rotation.y-speed}, 1000)
    .start()
}

function r_wheel_spin_forward(){
    new TWEEN.Tween(r_wheel1.rotation)
    .to({y:r_wheel1.rotation.y+speed})
    .start()
    new TWEEN.Tween(r_wheel2.rotation)
    .to({y:r_wheel2.rotation.y+speed})
    .start()
    new TWEEN.Tween(r_wheel3.rotation)
    .to({y:r_wheel3.rotation.y+speed})
    .start()
    new TWEEN.Tween(r_wheel4.rotation)
    .to({y:r_wheel4.rotation.y+speed})
    .start()
    new TWEEN.Tween(r_wheel5.rotation)
    .to({y:r_wheel5.rotation.y+speed})
    .start()
}

function r_wheel_spin_backward(){
    new TWEEN.Tween(r_wheel1.rotation)
    .to({y:r_wheel1.rotation.y-speed})
    .start()
    new TWEEN.Tween(r_wheel2.rotation)
    .to({y:r_wheel2.rotation.y-speed})
    .start()
    new TWEEN.Tween(r_wheel3.rotation)
    .to({y:r_wheel3.rotation.y-speed})
    .start()
    new TWEEN.Tween(r_wheel4.rotation)
    .to({y:r_wheel4.rotation.y-speed})
    .start()
    new TWEEN.Tween(r_wheel5.rotation)
    .to({y:r_wheel5.rotation.y-speed})
    .start()
}

function move_up(distance){
    new TWEEN.Tween(robot.position)
    .to({x:robot.position.x + Math.cos(robot.rotation.y)*distance, z: robot.position.z + Math.sin(robot.rotation.y)*distance})
    .start()
}

function move_down(){
    new TWEEN.Tween(robot.position)
    .to({x:robot.position.x + Math.cos(robot.rotation.y)*speed, z: robot.position.z - Math.sin(robot.rotation.y)*speed})
    .start()
}

function original(){
    new TWEEN.Tween(l_arm.rotation)
    .to({x:[-Math.PI*150/180], z:[-20*Math.PI/180], y : [0]}, 2000)
    .start()
    new TWEEN.Tween(l_forearm.rotation)
    .to({x:[0], z: [-Math.PI/2], y: [0]}, 2000)
    .start()

    new TWEEN.Tween(r_arm.rotation)
    .to({x:[Math.PI*150/180], z:[-20*Math.PI/180], y : [0]}, 2000)
    .start()
    new TWEEN.Tween(r_forearm.rotation)
    .to({x:[0], z: [-Math.PI/2], y: [0]}, 2000)
    .start()
}

function up_arms(){
    new TWEEN.Tween(l_arm.rotation)
    .to({x:[0], z:[-Math.PI/3], y: [0]}, 2000)
    .start()
    new TWEEN.Tween(l_forearm.rotation)
    .to({x:[Math.PI/2], z: [Math.PI/2], y: [-Math.PI/2+ Math.PI/3]}, 2000)
    .start()
    new TWEEN.Tween(r_arm.rotation)
    .to({x:[0], z:[-Math.PI/3], y: [0]}, 2000)
    .start()
    new TWEEN.Tween(r_forearm.rotation)
    .to({x:[Math.PI/2], z: [-Math.PI/2], y: [Math.PI/2+ Math.PI/3]}, 2000)
    .start()
}

function teclear_izd(){
    new TWEEN.Tween(l_arm.rotation)
    .to({x:[0], z:[-Math.PI/2, -Math.PI/3], y: [0]}, 2000)
    .start()
    new TWEEN.Tween(l_forearm.rotation)
    .to({x:[Math.PI/2], z: [Math.PI/2, ], y: [-Math.PI/2, -Math.PI/2+ Math.PI/3]}, 2000)
    .start()
}

function teclear_dch(){
    new TWEEN.Tween(r_arm.rotation)
    .to({x:[0], z:[-Math.PI/2, -Math.PI/3], y: [0]}, 2000)
    .start()
    new TWEEN.Tween(r_forearm.rotation)
    .to({x:[Math.PI/2], z: [-Math.PI/2], y: [Math.PI/2, Math.PI/2+ Math.PI/3]}, 2000)
    .start()
}

function teclear(){
    teclear_dch();
    sleep(1000).then(() => {
        teclear_izd();
        sleep(1000).then(() => {
            teclear_dch();
            sleep(1000).then(() => {
                teclear_izd();
            })
        })
    })
}

function animate(){
    turn_left()
    l_wheel_spin_forward()
    r_wheel_spin_backward()
    sleep(2000).then(() => {
        move_up(60);
        l_wheel_spin_forward();
        r_wheel_spin_forward();
        up_arms()
        sleep(1000).then(() => {
            teclear()
            sleep(5000).then(() => {
                original()
                turn_right()
                sleep(2000).then(() => {
                    move_up(120);
                    l_wheel_spin_forward();
                    r_wheel_spin_forward();
                    up_arms()
                    sleep(1000).then(() => {
                        teclear()
                        sleep(5000).then(() => {
                            original()
                            turn_left()
                            sleep(2000).then(() => {
                                move_up(60);
                                sleep(2000).then(() => {
                                    turn_right()
                                })
                            })
                        })
                    })
                })
            })
        })
    })
    
}