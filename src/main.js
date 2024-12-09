import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#b3eeff')
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const LetterShader = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        uniform float time;
        void main() {
            vec3 pos = position;
            pos.y += sin(time + position.x) * 0.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    `
});

const NumberShader = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        uniform float time;
        void main() {
            vec3 pos = position;
            pos.y += sin(time + position.x) * 0.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); 
        }
    `
});

const Loader = new FontLoader();
Loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    const letterGeometry = new TextGeometry('N', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, LetterShader);
    letterMesh.position.set(-2, 0, 0);
    scene.add(letterMesh);

    const numberGeometry = new TextGeometry('1', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, NumberShader);
    numberMesh.position.set(0, 0, 0);
    scene.add(numberMesh);
});


camera.position.z = 7;


function Animate() {
    requestAnimationFrame(Animate);
    LetterShader.uniforms.time.value += 0.02;
    NumberShader.uniforms.time.value += 0.02;
    renderer.render(scene, camera);
}
Animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}