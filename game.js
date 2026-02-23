import * as THREE from 'three';
import { AsteroidMesh } from './meshes/asteroid.mesh.js';
import { BulletMesh } from './meshes/bullet.mesh.js';
import { PlayerMesh } from './meshes/player.mesh.js';
import { ScoreModel } from './models/score.model.js';
import { PerspectiveCamera } from './cameras/perspective.camera.js';
import { AmbientLight } from './lights/ambient.light.js';
import { WebGLRenderer } from './renderers/webgl.renderer.js';
import { GameOverEvent } from './events/game.over.event.js';
import { AsteroidCreatedEvent } from './events/asteroid.create.event.js'
import { PlayerCollisionEvent } from './events/player.collision.event.js'
import { BulletCollisionEvent } from './events/bullet.collision.event.js';
import { AsteroidOutsideEvent } from './events/asteroid.outside.event.js';
import { BulletOutsideEvent } from './events/bullet.outside.event.js'
import { PlayerShotEvent } from './events/player.shot.event.js'

export class Game extends EventTarget {
  static MAX_ASTEROIDS = 10;

  score = new ScoreModel();
  asteroids = []
  scene = new THREE.Scene();
  group = new THREE.Group();
  renderer = new WebGLRenderer();
  camera = new PerspectiveCamera();
  light = new AmbientLight();
  player = new PlayerMesh(this.group);
  asteroidInterval = null;

  constructor() {
    super();
    this.scene.add(this.group);
    this.group.add(this.light);
    this.group.add(this.camera);
    this.group.add(this.player);
    this.player.start();
    this.setWindowEvents();
    this.setKeyboardEvents();
  }

  setWindowEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener(PlayerShotEvent.NAME, (event) => {
      this.group.add(event.detail.bullet);
    });

    window.addEventListener(BulletOutsideEvent.NAME, (event) => {
      this.removeBullet(event.detail.bullet);
    });

    window.addEventListener(AsteroidCreatedEvent.NAME, (event) => {
      this.group.add(event.detail.asteroid);
    });

    window.addEventListener(PlayerCollisionEvent.NAME, (event) => {
      this.removeAsteroid(event.detail.asteroid);
      this.score.subtractLife();
      this.checkGameOver();
    });

    window.addEventListener(BulletCollisionEvent.NAME, (event) => {
      const { asteroid, bullet } = event.detail;
      this.removeAsteroid(asteroid);
      this.removeBullet(bullet);
      this.score.addPoints();
      this.checkGameOver();
    });

    window.addEventListener(AsteroidOutsideEvent.NAME, (event) => {
      this.removeAsteroid(event.detail.asteroid);
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

  removeAsteroid(asteroid) {
    asteroid.stop();
    this.group.remove(asteroid);
  }

  removeBullet(bullet) {
    bullet.stop();
    this.group.remove(bullet);
  }

  checkGameOver() {
    if (this.score.lives <= 0) {
      this.stop();
      window.dispatchEvent(new GameOverEvent(this.score.points));
    }
  }

  start() {
    this.update();
    this.asteroidInterval = setInterval(() => this.addAsteroid(), 1000);
  }

  addAsteroid() {
    if (this.getAsteroids().length < Game.MAX_ASTEROIDS) {
      const asteroid = new AsteroidMesh({
        getPlayer: () => this.player,
        getBullets: () => this.getBullets(),
      });
      asteroid.start();
    }
  }

  stop() { clearInterval(this.asteroidInterval); }

  update() {
    requestAnimationFrame(() => this.update());
    this.renderer.render(this.scene, this.camera);
  }

  reset() {
    this.score.reset();
    this.player.stop();
    this.player.resetPosition().resetRotation();
    this.removeAllBullets();
    this.removeAllAsteroids();
    this.start();
  }

  getAsteroids() {
    return this.group.children.filter((asteroid) => asteroid instanceof AsteroidMesh);
  }

  getBullets() {
    return this.group.children.filter((bullet) => bullet instanceof BulletMesh);
  }

  removeAllAsteroids() {
    this.getAsteroids().map((asteroid) => {
      asteroid.stop();
      this.group.remove(asteroid);
    });
  }

  removeAllBullets() {
    this.getBullets().map((bullet) => {
      bullet.stop();
      this.group.remove(bullet);
    });
  }
}
