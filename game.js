import * as THREE from 'three';
import { AsteroidMesh } from './meshes/asteroid.mesh.js';
import { PlayerMesh } from './meshes/player.mesh.js';
import { ScoreModel } from './models/score.model.js';
import { PerspectiveCamera } from './cameras/perspective.camera.js';
import { AmbientLight } from './lights/ambient.light.js';
import { WebGLRenderer } from './renderers/webgl.renderer.js';
import { GameOverEvent } from './events/game.over.event.js';
import { AsteroidCreatedEvent } from './events/asteroid.create.event.js'

export class Game extends EventTarget {
  static MAX_ASTEROIDS = 10;

  score = new ScoreModel();
  asteroids = []
  scene = new THREE.Scene();
  group = new THREE.Group();
  renderer = new WebGLRenderer();
  camera = new PerspectiveCamera();
  light = new AmbientLight();
  player = null;
  asteroidInterval = null;

  constructor() {
    super();
    this.scene.add(this.group);
    this.group.add(this.light);
    this.group.add(this.camera);
    document.body.appendChild(this.score.domElement);
    this.setWindowEvents();
    this.setKeyboardEvents();
    this.player = new PlayerMesh(this.group);
    this.group.add(this.player);
    this.player.start();
    this.player.addEventListener('player.shot', (event) => {
      const bullet = event.detail.bullet;
      this.group.add(bullet);
      bullet.addEventListener('bullet.outside', (e) => {
        this.removeBullet(e.detail.bullet);
      });
    });
    this.setupAsteroidCollisionListeners();
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

  setupAsteroidCollisionListeners() {
    this.addEventListener('asteroid-created', (event) => {
      const asteroid = event.detail.asteroid;

      asteroid.addEventListener('player.collision', () => {
        this.score.subtractLife(1);
        this.removeAsteroid(asteroid);
        this.checkGameOver();
      });

      asteroid.addEventListener('bullet.collision', (e) => {
        const bullet = e.detail.bullet;
        this.score.addPoints(10);
        this.removeAsteroid(asteroid);
        this.removeBullet(bullet);
        this.checkGameOver();
      });

      asteroid.addEventListener('asteroid.outside', () => {
        this.removeAsteroid(asteroid);
      });
    });
  }

  removeAsteroid(asteroid) {
    asteroid.stop();
    this.group.remove(asteroid);
    this.asteroids = this.asteroids.filter(a => a !== asteroid);
  }

  removeBullet(bullet) {
    bullet.stop();
    this.group.remove(bullet);
    this.player.bullets = this.player.bullets.filter(b => b !== bullet);
  }

  checkGameOver() {
    if (this.score.lives <= 0) {
      this.stop();
      this.dispatchEvent(new GameOverEvent(this.score.points));
    }
  }

  start() {
    this.update();

    this.asteroidInterval = setInterval(() => {
      if (this.asteroids.length < Game.MAX_ASTEROIDS) {
        const ast = new AsteroidMesh({ player: this.player, group: this.group });
        this.asteroids.push(ast);
        this.group.add(ast);
        ast.start();
        this.dispatchEvent(new AsteroidCreatedEvent(ast));
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
    this.player.stop();
    this.player.removeAllBullets();
    this.player.resetPosition().resetRotation();
    this.removeAllAsteroids();
    this.start();
  }

  removeAllAsteroids() {
    this.asteroids.forEach((ast) => {
      ast.stop();
      this.group.remove(ast);
    });
    this.asteroids = [];
  }
}
