document.body.style.margin = 0;
import * as THREE from 'three';
import { Peer } from 'peerjs';

const state = { shot: false, }

// Create a new EventTarget to manage custom events
const ee = new EventTarget();

// Create a new Peer
const peer = new Peer();

peer.on('open', (id) => {
  console.log('My peer ID is: ' + id);
  ee.dispatchEvent(new CustomEvent('peer.open', { detail: { id } }));
});

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

const animations = {
  move: () => {
    triangle.rotation.z += moves.rotation;
    triangle.position.x += moves.forward * Math.sin(-triangle.rotation.z);
    triangle.position.y += moves.forward * Math.cos(-triangle.rotation.z);
  },
  shot: () => {
    if (!state.shot) return;

    const shot = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff9900 })
    );

    const { x, y } = triangle.position.clone();
    shot.position.set(x, y, -0.1); // Ensure shot is in back of the triangle
    group.add(shot);

    // Move shot forward in the direction the triangle is facing
    const shotSpeed = 0.5;
    const shotDirection = new THREE.Vector3(
      Math.sin(-triangle.rotation.z),
      Math.cos(-triangle.rotation.z),
      0
    ).normalize();

    const shotInterval = setInterval(() => {
      shot.position.addScaledVector(shotDirection, shotSpeed);
      // Remove shot if it goes too far
      if (Math.abs(shot.position.x) > 100 || Math.abs(shot.position.y) > 100) {
        group.remove(shot);
        clearInterval(shotInterval);
      }
    }, 16);
  }
}

function animate() {
  requestAnimationFrame(animate);
  animations.move();
  animations.shot();
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// left and right arrow keys to rotate the triangle
// up and down arrow keys to move the triangle forward and backward
// Make triangle shot on spacebar press
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowLeft': moves.rotation = 0.1; break;
    case 'ArrowRight': moves.rotation = -0.1; break;
    case 'ArrowUp': moves.forward = 0.1; break;
    case 'ArrowDown': moves.forward = -0.1; break;
    case 'q': toggleQRcode(); break;
    case ' ': state.shot = true; break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowLeft': case 'ArrowRight': moves.rotation = 0; break;
    case 'ArrowUp': case 'ArrowDown': moves.forward = 0; break;
    case ' ': state.shot = false; break;
  }
});

const toggleQRcode = () => {
  const qrCode = document.getElementById('qr-code');
  if (qrCode) {
    qrCode.remove();
  } else {
    const img = document.createElement('img');
    img.id = 'qr-code';
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=` + getGameURL();
    img.style.position = 'fixed';
    img.style.top = '1rem';
    img.style.right = '1rem';
    document.body.appendChild(img);
  }
}

const getGameURL = (id = peer.id) => {
  const url = new URL(window.location.href);
  url.pathname = 'controls.html';
  url.searchParams.set('peer', id);
  return url.toString();
}
