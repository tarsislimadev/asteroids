document.body.style.margin = 0;

import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a group to hold all objects
const group = new THREE.Group();
scene.add(group);

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
group.add(camera);

// Create a light
const light = new THREE.AmbientLight(0xffffff, 0.5);
group.add(light);

// Create a gradient yellow triangle
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const colors = new Float32Array([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0]);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const triangle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
group.add(triangle);

// Animation loop
const moves = { rotation: 0, forward: 0, }

function animate() {
  requestAnimationFrame(animate);
  triangle.rotation.z += moves.rotation;
  triangle.position.x += moves.forward * Math.sin(-triangle.rotation.z);
  triangle.position.y += moves.forward * Math.cos(-triangle.rotation.z);
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// left and right arrow keys to rotate the triangle // up and down arrow keys to move the triangle forward and backward
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowLeft': moves.rotation = 0.1; break;
    case 'ArrowRight': moves.rotation = -0.1; break;
    case 'ArrowUp': moves.forward = 0.1; break;
    case 'ArrowDown': moves.forward = -0.1; break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowLeft': case 'ArrowRight': moves.rotation = 0; break;
    case 'ArrowUp': case 'ArrowDown': moves.forward = 0; break;
  }
});
