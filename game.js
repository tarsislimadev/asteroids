import * as THREE from 'three';
import { AsteroidMesh } from './meshes/asteroid.mesh.js';
import { PlayerMesh } from './meshes/player.mesh.js';
import { ScoreModel } from './models/score.model.js';
import { PerspectiveCamera } from './cameras/perspective.camera.js';
import { AmbientLight } from './lights/ambient.light.js';
import { WebGLRenderer } from './renderers/webgl.renderer.js';

export class Game extends EventTarget {
  static MAX_ASTEROIDS = 10;

  score = new ScoreModel();
  asteroids = []
  scene = new THREE.Scene();
  group = new THREE.Group();
  renderer = new WebGLRenderer();
  camera = new PerspectiveCamera({});
  light = new AmbientLight({});
  player = new PlayerMesh({});
  asteroidInterval = null;

  constructor() {
    super();
    this.scene.add(this.group); // Adds group to scene
    this.group.add(this.player); // Adds player to group
    this.group.add(this.light); // Adds light to group
    this.group.add(this.camera); // Adds camera to group
    document.body.appendChild(this.score.domElement); // Adds score element to DOM
    this.setWindowEvents();
    this.setKeyboardEvents();
    this.player.start(); // Starts player update loop
    this.player.addEventListener('player.shot', (event) => {
      const bullet = event.detail.bullet;
      this.group.add(bullet);
    });
  }

  setWindowEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setKeyboardEvents() {
    ['keydown', 'keyup'].map(event_name => {
      window.addEventListener(event_name, (event) => {
        const isKeyDown = event_name === 'keydown' ? 1 : 0;
        switch (event.key) {
          case 'ArrowLeft': isKeyDown ? this.player.startRotateLeft() : this.player.stopRotateLeft(); break;
          case 'ArrowRight': isKeyDown ? this.player.startRotateRight() : this.player.stopRotateRight(); break;
          case 'ArrowUp': isKeyDown ? this.player.startMoveForward() : this.player.stopMoveForward(); break;
          case 'ArrowDown': isKeyDown ? this.player.startMoveBackward() : this.player.stopMoveBackward(); break;
          case ' ': isKeyDown ? this.player.startShot() : this.player.stopShot(); break;
        }
      });
    });
  }

  start() {
    this.update();

    this.asteroidInterval = setInterval(() => {
      if (this.asteroids.length < Game.MAX_ASTEROIDS) {
        const ast = new AsteroidMesh({ player: this.player, });
        this.asteroids.push(ast);
        this.group.add(ast);
        ast.start();
      }
    }, 1000);
  }

  stop() { clearInterval(this.asteroidInterval); }

  update() {
    requestAnimationFrame(() => this.update());
    this.renderer.render(this.scene, this.camera);
  }

  reset() {
    this.score.reset();
    this.player.resetPosition().resetRotation().removeAllBullets();
    this.removeAllAsteroids();
  }

  removeAllAsteroids() {
    this.asteroids.map((ast) => this.group.remove(ast));
    this.asteroids = [];
  }
}
