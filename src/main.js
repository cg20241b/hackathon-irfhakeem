import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#b3eeff');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const studentID = 291;
const ambientIntensity = (200 + studentID) / 1000;

const cubeSize = 0.5;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        glowColor: { value: new THREE.Color(0.96470588, 0.9450980392156862, 0.03529411764705882) },
    },
    vertexShader: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        void main() {
            gl_FragColor = vec4(glowColor, 1.0);
        }
    `,
});
const centralCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(centralCube);

const pointLight = new THREE.PointLight(0xffffff, 1, 20);
scene.add(pointLight);

const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const LetterShader = new THREE.ShaderMaterial({
        uniforms: {
            ambient: { value: ambientIntensity },
            lightPos: { value: new THREE.Vector3() },
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float ambient;
            uniform vec3 lightPos;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec3 lightDir = normalize(lightPos - vPosition);
                float diffuse = max(dot(vNormal, lightDir), 0.0);
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

                gl_FragColor = gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        `,
    });

    // Digit ShaderMaterial
    const NumberShader = new THREE.ShaderMaterial({
        uniforms: {
            ambient: { value: ambientIntensity },
            lightPos: { value: new THREE.Vector3() },
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float ambient;
            uniform vec3 lightPos;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec3 lightDir = normalize(lightPos - vPosition);
                float diffuse = max(dot(vNormal, lightDir), 0.0);
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float specular = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);

                gl_FragColor = gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); 
            }
        `,
    });

    const letterGeometry = new TextGeometry('N', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, LetterShader);
    letterMesh.position.set(-4, 0, 0);
    scene.add(letterMesh);

    const numberGeometry = new TextGeometry('1', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, NumberShader);
    numberMesh.position.set(2, 0, 0);
    scene.add(numberMesh);
});

camera.position.z = 7;

function animate() {
    requestAnimationFrame(animate);
    
    pointLight.position.copy(centralCube.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('keydown', (event) => {
    const step = 0.2;
    if (event.key === 'w') centralCube.position.y += step;
    if (event.key === 's') centralCube.position.y -= step;
    if (event.key === 'a') camera.position.x -= step;
    if (event.key === 'd') camera.position.x += step;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
