import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, controls, scene, renderer, pc, group, mouse, raycaster;

// initial conditions hand-picked to look nice
var a_0 = 1.062477352437103;
var b_0 = 8.038291607940321;
var f_0 = 15.4135763998;
var g_0 = 1.8347793740599485;

init();
timeskip(a_0, b_0, f_0, g_0);
render(a_0, b_0, f_0, g_0);

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 50 );
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0x080808, 1 );
    document.body.appendChild( renderer.domElement );

    group = new THREE.Group();

    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = false;

    var arrayCurve = lorenz(a_0, b_0, f_0, g_0);
    var curve = new THREE.CatmullRomCurve3(arrayCurve);
    var geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints(111111);

    // points to apply to the geometry defined by the curve
    var pcMat = new THREE.PointsMaterial();
    pcMat.color = new THREE.Color(0x5555ff);
    pcMat.transparent = true;
    pcMat.size = 0.01;
    pcMat.blending = THREE.AdditiveBlending;
    pc = new THREE.Points(geometry, pcMat);
    pc.sizeAttenuation = false;
    pc.sortPoints = true;

    group.add(pc);
    scene.add( group );

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    window.addEventListener( 'mousemove', onMouseMove, false );
}

function onMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function render(a_0, b_0, f_0, g_0) {

    requestAnimationFrame( function() { render(a_0, b_0, f_0, g_0) } );
    controls.update();
    renderer.render( scene, camera );

    // trying to add interactivity
    raycaster.setFromCamera( mouse, camera );
    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObject( pc );
    for ( var i = 0; i < intersects.length; i++ ) {
        intersects[i].point.sub( mouse ).multiplyScalar(5);
        // pc.geometry.colors[intersects[i].index].set(0xffffff);
    }

    pc.geometry.colorsNeedUpdate = true;

    // randomly varying the initial parameters of the lorenz attractor
    var geometry = pc.geometry;
    var a = a_0+Math.random()*6;
    var b = b_0+Math.random()*7;
    var x_drift = (f_0+Math.random()*8)*a;
    var y_drift = g_0+Math.random();
    var dt = 0.0002;

    geometry.vertices.forEach(function(v){
        v.x = v.x + dt*(-a*v.x + v.y*v.y   - v.z*v.z   + x_drift);
        v.y = v.y + dt*(-v.y   +  v.x*v.y  - b*v.x*v.z + y_drift);
        v.z = v.z + dt*(-v.z   +
