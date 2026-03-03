import * as THREE from 'three';
import synaptic from 'synaptic';
import { AsteroidMesh } from './meshes/asteroid.mesh.js';
import { BulletMesh } from './meshes/bullet.mesh.js';
import { PlayerMesh } from './meshes/player.mesh.js';
import { ScoreModel } from './models/score.model.js';
import { PerspectiveCamera } from './cameras/perspective.camera.js';
import { AmbientLight } from './lights/ambient.light.js';
import { WebGLRenderer } from './renderers/webgl.renderer.js';
import { GameOverEvent } from './events/game.over.event.js';
import { AsteroidCreatedEvent } from './events/asteroid.created.event.js'
import { PlayerCollisionEvent } from './events/player.asteroid.collision.event.js'
import { AsteroidBulletCollisionEvent } from './events/asteroid.bullet.collision.event.js';
import { AsteroidOutsideEvent } from './events/asteroid.outside.event.js';
import { BulletOutsideEvent } from './events/bullet.outside.event.js'
import { PlayerShotEvent } from './events/player.shot.event.js'
import { GameWinEvent } from './events/game.win.event.js';
import { NeuralNetwork } from './neural.network.js';

export class Game {
  static MAX_ASTEROIDS = 100;
  static MAX_SCORE_POINTS = 100;

  neural_network = [this.createNeuralNetwork()];

  score = new ScoreModel();
  asteroids = [];
  scene = new THREE.Scene();
  group = new THREE.Group();
  renderer = new WebGLRenderer();
  camera = new PerspectiveCamera();
  light = new AmbientLight();
  player = new PlayerMesh({ createBullet: () => this.addBullet(), getAsteroids: () => this.getAsteroids() });
  asteroidInterval = null;

  constructor(width, height) {
    this.scene.add(this.group);
    this.group.add(this.light);
    this.group.add(this.camera);
    this.group.add(this.player);
    this.player.start();
    this.renderer.setSize(width, height);
    this.setWindowEvents();
  }

  setWindowEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener(GameOverEvent.NAME, () => {
      alert('Game over! ' + this.score.toString());
      this.reset();
    })

    window.addEventListener(GameWinEvent.NAME, () => {
      alert('You won! ' + this.score.toString());
      this.reset();
    })

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

    window.addEventListener(AsteroidBulletCollisionEvent.NAME, (event) => {
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

  runPlayer(action, startStop) {
    switch (action) {
      case 'left': startStop ? this.player.startRotateLeft() : this.player.stopRotateLeft(); break;
      case 'right': startStop ? this.player.startRotateRight() : this.player.stopRotateRight(); break;
      case 'up': startStop ? this.player.startMoveForward() : this.player.stopMoveForward(); break;
      case 'down': startStop ? this.player.startMoveBackward() : this.player.stopMoveBackward(); break;
      case 'shoot': startStop ? this.player.startShot() : this.player.stopShot(); break;
    }
  }

  setKeyboardEvents() {
    ['keydown', 'keyup'].map(event_name => {
      window.addEventListener(event_name, (event) => {
        event.preventDefault();
        const isKeyDown = event_name === 'keydown' ? 1 : 0;
        switch (event.key) {
          case 'ArrowLeft': this.runPlayer('left', isKeyDown); break;
          case 'ArrowRight': this.runPlayer('right', isKeyDown); break;
          case 'ArrowUp': this.runPlayer('up', isKeyDown); break;
          case 'ArrowDown': this.runPlayer('down', isKeyDown); break;
          case ' ': this.runPlayer('shoot', isKeyDown); break;
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
    switch (true) {
      case this.score.getLives() <= 0: {
        this.stop();
        window.dispatchEvent(new GameOverEvent(this.score.getPoints()));
      } break;
      case this.score.getPoints() >= Game.MAX_SCORE_POINTS: {
        this.stop();
        window.dispatchEvent(new GameWinEvent(this.score.getPoints()));
      } break;
    }
  }

  enableAIControls() {

  }

  start(type) {
    let isAI = type === NeuralNetwork.NAME

    if (!isAI) {
      this.setKeyboardEvents();
    }

    this.update(isAI);
    this.asteroidInterval = setInterval(() => this.addAsteroid(), 100);
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

  addBullet() {
    const bullet = new BulletMesh({
      x: this.player.position.x,
      y: this.player.position.y,
      z: this.player.rotation.z,
      getAsteroids: () => this.getAsteroids()
    });
    bullet.start();
    window.dispatchEvent(new PlayerShotEvent({ player: this.player, bullet }));
  }

  stop() { clearInterval(this.asteroidInterval); }

  getNeuralNetwork() {
    return this.neural_network[this.neural_network.length - 1]
  }

  update(isAI) {
    console.log('update game', { isAI })

    if (true || isAI) {
      const input = [
        this.player.getSensorData(0),
        this.player.getSensorData(1),
        this.player.getSensorData(2),
        this.player.getSensorData(3),
        this.player.getSensorData(4),
        this.player.getSensorData(5),
        this.player.getSensorData(6),
        this.player.getSensorData(7),
      ];

      const output = this.getNeuralNetwork().activate(input);
      // this.getNeuralNetwork().propagate(0.3, [1]);

      const [left, right, up, down, shoot] = output
      this.runPlayer('left', left);
      this.runPlayer('right', right);
      this.runPlayer('up', up);
      this.runPlayer('down', down);
      this.runPlayer('shoot', shoot);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.update(isAI));
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

  createNeuralNetwork() {
    const inputLayer = new synaptic.Layer(8);
    const hiddenLayer1 = new synaptic.Layer(10);
    const hiddenLayer2 = new synaptic.Layer(10);
    const hiddenLayer3 = new synaptic.Layer(10);
    const outputLayer = new synaptic.Layer(5);

    // Connect layers 
    inputLayer.project(hiddenLayer1);
    hiddenLayer1.project(hiddenLayer2);
    hiddenLayer2.project(hiddenLayer3);
    hiddenLayer3.project(outputLayer);

    // Build network 
    const net = new synaptic.Network({
      input: inputLayer,
      hidden: [hiddenLayer1, hiddenLayer2, hiddenLayer3],
      output: outputLayer,
    });

    return net;
  }
}
