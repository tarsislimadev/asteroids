document.body.style.margin = 0;

import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a light
const light = new THREE.AmbientLight(0xffffff, 0.5);
light.position.set(0, 0, 1);
camera.add(light);

// Create a yellow triangle
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  0.0, 1.0, 0.0,  // Top vertex
  -1.0, -1.0, 0.0,  // Bottom left vertex
  1.0, -1.0, 0.0   // Bottom right vertex
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
const triangle = new THREE.Mesh(geometry, material);
triangle.rotation.x = Math.PI / 4; // Rotate 45 degrees around the X-axis
triangle.position.z = -5; // Position the triangle in front of the camera
camera.add(triangle);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  camera.position.z += 0.01; // Move the camera forward
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
