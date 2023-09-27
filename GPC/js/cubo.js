// Escena cubo

// Cargar librería
import * as THREE from '../lib/three.module.js'

// Variables globales
var scene = new THREE.Scene()
scene.background = new THREE.Color( 0x220044 )

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight )

document.body.appendChild( renderer.domElement )

// Cubo
var geometry = new THREE.BoxGeometry()
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
var cubo = new THREE.Mesh( geometry, material )
scene.add(cubo)

// Posición camara
camera.position.z = 5

// Render
renderer.render( scene, camera )
