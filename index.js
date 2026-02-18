document.body.style.margin = 0;
import * as THREE from 'three';
import { Peer } from 'peerjs';

const state = { shot: false, score: 0, lives: 10 };

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
const player = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
group.add(player);

// Animation loop
const moves = { rotation: 0, forward: 0, }

const random = (max, min = 0) => Math.floor(max * Math.random()) + min;

const animations = {
  move: () => {
    player.rotation.z += moves.rotation;
    player.position.x += moves.forward * Math.sin(-player.rotation.z);
    player.position.y += moves.forward * Math.cos(-player.rotation.z);
  },
  bullet: () => {
    if (!state.shot) return;

    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff9900 })
    );

    const { x, y } = player.position.clone();
    bullet.position.set(x, y, -0.1); // Ensure bullet is in back of the triangle
    group.add(bullet);

    // Move bullet forward in the direction the triangle is facing
    const bulletSpeed = 0.5;
    const bulletDirection = new THREE.Vector3(
      Math.sin(-player.rotation.z),
      Math.cos(-player.rotation.z),
      0
    ).normalize();

    const bulletInterval = setInterval(() => {
      bullet.position.addScaledVector(bulletDirection, bulletSpeed);
      // Check for collision with asteroids
      group.children.forEach((asteroid) => {
        if (asteroid.geometry instanceof THREE.PlaneGeometry) {
          const distance = bullet.position.distanceTo(asteroid.position);
          if (distance < 0.3) { // Collision threshold
            group.remove(asteroid); // Remove asteroid
            group.remove(bullet); // Remove bullet
            addScore(+1.0);
            clearInterval(bulletInterval);
          }
        }
      });
      // Remove bullet if it goes too far
      if (Math.abs(bullet.position.x) > 100 || Math.abs(bullet.position.y) > 100) {
        group.remove(bullet);
        clearInterval(bulletInterval);
      }
    }, 16);
  },
  asteroid: () => {
    const ast = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.0),
      new THREE.MeshBasicMaterial({ color: 0x999999 }),
    );

    ast.position.set(random(10, 1), random(10, 1), -0.1); // Ensure ast is in back of the triangle
    group.add(ast);

    // Move ast forward in the direction the triangle is facing
    const astSpeed = 0.5;
    const astDirection = new THREE.Vector3(
      random(1, -2),
      random(1, -2),
      0
    ).normalize();

    console.log('Asteroid created at', ast.position, 'moving in direction', astDirection);

    const astInterval = setInterval(() => {
      ast.position.addScaledVector(astDirection, astSpeed);
      // Check for collision with triangle
      const distance = ast.position.distanceTo(player.position);
      if (distance < 0.5) { // Collision threshold
        group.remove(ast); // Remove asteroid
        addScore(-1.0);
        subtractLife(1);
        clearInterval(astInterval);
      }
      // Remove ast if it goes too far
      if (Math.abs(ast.position.x) > 100 || Math.abs(ast.position.y) > 100) {
        group.remove(ast);
        clearInterval(astInterval);
      }
    }, 500);
  }
}

function animate() {
  requestAnimationFrame(animate);
  animations.move();
  animations.bullet();
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setInterval(() => animations.asteroid(), 1000);

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

// // Score

const createScore = () => {
  const el = document.createElement('div');
  el.id = 'score';
  el.style.position = 'fixed';
  el.style.top = '1rem';
  el.style.left = '1rem';
  el.style.fontSize = '2rem';
  el.style.color = '#ffffff';
  document.body.appendChild(el);
  return el;
}

const scoreEl = createScore();

const setScore = (score) => {
  if (score < 0) score = 0;
  state.score = +score;
  scoreEl.textContent = `Score: ${state.score}`;
}

setScore(0);

const addScore = (score) => setScore(state.score + +score);

// // Lives

const createLives = () => {
  const el = document.createElement('div');
  el.id = 'life';
  el.style.position = 'fixed';
  el.style.top = '3rem';
  el.style.left = '1rem';
  el.style.fontSize = '2rem';
  el.style.color = '#ffffff';
  document.body.appendChild(el);
  return el;
}

const lifeEl = createLives();

const setLives = (lives) => {
  state.lives = +lives;
  lifeEl.textContent = `Lives: ${state.lives}`;
  if (state.lives <= 0) gameOver();
}

setLives(10);

const gameOver = () => {
  alert('Game over! Final Score: ' + state.score);
  setScore(0);
  setLives(10);
  centerPlayer();
  stopAnimations();
  removeAllAsteroidsAndBullets();
}

const subtractLife = (points) => setLives(state.lives - +points);

const centerPlayer = () => {
  player.position.set(0, 0, 0);
  player.rotation.set(0, 0, 0);
  console.info('Player centered at position ', player.position, ' with rotation ', player.rotation);
}

const stopAnimations = () => {
  state.shot = false;
  moves.rotation = 0;
  moves.forward = 0;
}

const removeAllAsteroidsAndBullets = () => {
  group.children.forEach((child) => {
    const isAsteroid = child.geometry instanceof THREE.PlaneGeometry;
    const isBullet = child.geometry instanceof THREE.SphereGeometry;
    if (isAsteroid || isBullet) {
      group.remove(child);
      console.info('Removed', isAsteroid ? 'asteroid' : 'bullet', child);
    }
  });
}
