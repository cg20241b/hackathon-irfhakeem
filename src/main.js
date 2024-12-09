import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Membuat scene 3D dan mengatur BG menjadi warna gray
const scene = new THREE.Scene();
scene.background = new THREE.Color('#282929');

// Mengatur kamera untuk perspektif dengan aspek rasio dan jarak pandang tertentu
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Menyiapkan renderer WebGL untuk merender scene dan menambahkannya ke dokumen HTML
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Variabel untuk mengatur intensitas cahaya ambient berdasarkan nrp
const nrp = 291;
const ambientIntensity = (200 + nrp) / 1000;  // Intensitas cahaya ambient

// Membuat geometri dan material untuk cube, menggunakan shader custom untuk efek visual
const cubeSize = 0.5;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 } // Waktu untuk mengubah efek secara dinamis
    },
    vertexShader: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Shader untuk posisi objek
        }
    `,
    fragmentShader: `
        uniform float time;
        void main() {
            vec3 color = vec3(1.0, 0.8, 0.0); // Warna cube (kuning terang)
            float intensity = sin(time * 2.0) * 0.6 + 0.5; // Oscilasi intensitas berdasarkan waktu
            intensity = pow(intensity, 3.0); // Membuat efek glow lebih halus
            gl_FragColor = vec4(color * intensity, intensity);  // Menyusun warna akhir dengan glow
        }
    `,
});

// Menambahkan cube ke scene
const centralCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(centralCube);

// Menambahkan point light yang terang dengan efek bayangan
const pointLight = new THREE.PointLight(0xffffff, 20, 40);  // Membuat point dari cahaya dan mengatur warna, intensitas, dan distance dari cahaya tersebut
pointLight.castShadow = true; // Mengaktifkan bayangan dari point light
scene.add(pointLight);

// Meload font yang digunakan untuk membuat teks 3D
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {

    // Shader untuk huruf dengan pencahayaan dinamis dan specular plastik menggunakan Phong model (shininess sedang)
    const LetterShader = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: centralCube.position },
            lightIntensity: { value: 2.0 },
            ambientIntensity: { value: ambientIntensity },
            diffuseColor: { value: new THREE.Color(0.2, 0.2, 0.2) },
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            shininess: { value: 70.0 }
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
            uniform vec3 lightPosition;
            uniform float lightIntensity;
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform vec3 specularColor;
            uniform float shininess;
    
            varying vec3 vNormal;
            varying vec3 vPosition;
    
            void main() {
                // Menghitung pencahayaan berdasarkan posisi dan intensitas cahaya
                vec3 lightDir = normalize(lightPosition - vPosition);
                float distance = length(lightPosition - vPosition);
                float attenuation = lightIntensity / (1.0 + 0.1 * distance * distance);
    
                // Komponen ambient
                vec3 ambient = ambientIntensity * diffuseColor;
    
                // Komponen diffuse (menggunakan titik normal dan arah cahaya)
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * diffuseColor * attenuation;
    
                // Komponen specular phong model (menggunakan refleksi cahaya)
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = spec * specularColor * attenuation;
    
                gl_FragColor = vec4(ambient + diffuse + specular, 1.0); // Warna akhir
            }
        `
    });    

    // Shader untuk angka dengan pencahayaan yang lebih terang dan specular metal (shininess tinggi dan intensitas sedang)
    const NumberShader = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: centralCube.position },
            lightIntensity: { value: 3.0 },
            ambientIntensity: { value: ambientIntensity },
            diffuseColor: { value: new THREE.Color(0.95, 0.95, 0.95) },
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            shininess: { value: 200.0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Shader untuk posisi angka
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float lightIntensity;
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform vec3 specularColor;
            uniform float shininess;

            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // Sama seperti LetterShader, menghitung pencahayaan untuk angka
                vec3 lightDir = normalize(lightPosition - vPosition);
                float distance = length(lightPosition - vPosition);
                float attenuation = lightIntensity / (1.0 + 0.1 * distance * distance);

                vec3 ambient = ambientIntensity * diffuseColor;
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * diffuseColor * attenuation;

                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = spec * specularColor * attenuation;

                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);  // Warna akhir
            }
        `
    });

    // Membuat geometri dan mesh untuk huruf "N" dengan shader pencahayaan
    const letterGeometry = new TextGeometry('N', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, LetterShader);
    letterMesh.position.set(-4, 0, 0);
    scene.add(letterMesh);

    // Membuat geometri dan mesh untuk angka "1" dengan shader pencahayaan
    const numberGeometry = new TextGeometry('1', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, NumberShader);
    numberMesh.position.set(2, 0, 0); 
    scene.add(numberMesh);
});

// Mengatur posisi kamera di index z
camera.position.z = 7;

// Fungsi animasi untuk memperbarui posisi cahaya dan merender scene secara terus-menerus
function animate() {    
    pointLight.position.copy(centralCube.position);  // Posisikan cahaya mengikuti cube
    
    renderer.render(scene, camera);  // Render scene dengan kamera
    requestAnimationFrame(animate);  // Memanggil fungsi animate secara berulang
}
animate();

// Event listener untuk kontrol keyboard untuk menggerakkan cube dan kamera
window.addEventListener('keydown', (event) => {
    const step = 0.2;
    if (event.key === 'w') centralCube.position.y += step;
    if (event.key === 's') centralCube.position.y -= step;
    if (event.key === 'a') camera.position.x -= step;
    if (event.key === 'd') camera.position.x += step;
});

// Event listener untuk mengubah ukuran renderer dan kamera saat display diubah ukurannya
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();  // Memperbarui proyeksi kamera
    renderer.setSize(window.innerWidth, window.innerHeight);  // Mengatur ukuran renderer sesuai display
});
