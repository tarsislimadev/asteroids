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

const consolee = window.consolee || {}

class NeuralNetworkManager {
  generation = -1
  neural_networks = [];

  constructor(params) {
    this.params = params;
  }

  getNeuralNetwork() {
    consolee.log('Game.getNeuralNetwork', {})
    return this.neural_networks[this.neural_networks.length - 1].nn
  }

  getWeights() {
    // this.neural_networks[].layers.hidden[].list[].connections.inputs[].weight
  }

  createNeuralNetwork() {
    consolee.log('Game.createNeuralNetwork', {})

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
    if (this.neural_networks.length > 0) {
      return synaptic.Network.fromJSON(this.getNeuralNetwork().toJSON())
    } else {
      return new synaptic.Network({
        input: inputLayer,
        hidden: [hiddenLayer1, hiddenLayer2, hiddenLayer3],
        output: outputLayer,
      });
    }
  }

  saveGeneration() {
    this.neural_networks.push({
      score: this.params.getScore?.(),
      nn: this.createNeuralNetwork()
    })

    this.generation = this.neural_networks.length
    this.params.setGeneration?.(this.generation)
  }

  activate(input) {
    return this.getNeuralNetwork()
      .activate(input)
      .map((value) => value >= 0.5);
  }
}

export class Game {
  static MAX_ASTEROIDS = 100;
  static MAX_SCORE_POINTS = 100;

  isAI = false;
  isRunning = false;
  updateFrame = null;
  keyboardEventsSet = false;
  nn_manager = new NeuralNetworkManager({
    getScore: () => this.score.toJSON(),
    setGeneration: (generation) => this.score.setGeneration(generation),
  });

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
    consolee.log('Game.constructor', { width, height })
    this.scene.add(this.group);
    this.group.add(this.light);
    this.group.add(this.camera);
    this.group.add(this.player);
    this.renderer.setSize(width, height);
    this.setWindowEvents();
  }

  setWindowEvents() {
    consolee.log('Game.setWindowEvents', {})

    window.addEventListener(GameOverEvent.NAME, () => {
      consolee.log('Game.setWindowEvents.GameOverEvent', {})
      this.reset();
    })

    window.addEventListener(GameWinEvent.NAME, () => {
      consolee.log('Game.setWindowEvents.GameWinEvent', {})
      this.reset();
    })

    window.addEventListener(PlayerShotEvent.NAME, (event) => {
      consolee.log('Game.setWindowEvents.PlayerShotEvent', { event })
      this.group.add(event.detail.bullet);
    });

    window.addEventListener(BulletOutsideEvent.NAME, (event) => {
      consolee.log('Game.setWindowEvents.BulletOutsideEvent', { event })
      this.removeBullet(event.detail.bullet);
    });

    window.addEventListener(AsteroidCreatedEvent.NAME, (event) => {
      consolee.log('Game.setWindowEvents.AsteroidCreatedEvent', { event })
      this.group.add(event.detail.asteroid);
    });

    window.addEventListener(PlayerCollisionEvent.NAME, (event) => {
      consolee.log('Game.setWindowEvents.PlayerCollisionEvent', { event })
      this.removeAsteroid(event.detail.asteroid);
      this.score.subtractLife();
      this.checkGameOver();
    });

    window.addEventListener(AsteroidBulletCollisionEvent.NAME, (event) => {
      consolee.log('Game.setWindowEvents.AsteroidBulletCollisionEvent', { event })
      const { asteroid, bullet } = event.detail;
      this.removeAsteroid(asteroid);
      this.removeBullet(bullet);
      this.score.addPoints();
      this.checkGameOver();
    });

    window.addEventListener(AsteroidOutsideEvent.NAME, (event) => {
      consolee.log('Game.setWindowEvents.AsteroidOutsideEvent', { event })
      this.removeAsteroid(event.detail.asteroid);
    });
  }

  runPlayer(action, startStop) {
    consolee.log('Game.runPlayer', { action, startStop })

    switch (action) {
      case 'left': startStop ? this.player.startRotateLeft() : this.player.stopRotateLeft(); break;
      case 'right': startStop ? this.player.startRotateRight() : this.player.stopRotateRight(); break;
      case 'up': startStop ? this.player.startMoveForward() : this.player.stopMoveForward(); break;
      case 'down': startStop ? this.player.startMoveBackward() : this.player.stopMoveBackward(); break;
      case 'shoot': startStop ? this.player.startShot() : this.player.stopShot(); break;
    }
  }

  setKeyboardEvents() {
    if (this.keyboardEventsSet) return;
    this.keyboardEventsSet = true;
    ['keydown', 'keyup'].map(event_name => {
      window.addEventListener(event_name, (event) => {
        consolee.log('Game.setKeyboardEvents', { event_name, event })
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
    consolee.log('Game.removeAsteroid', { asteroid })
    asteroid.stop();
    this.group.remove(asteroid);
  }

  removeBullet(bullet) {
    consolee.log('Game.removeBullet', { bullet })
    bullet.stop();
    this.group.remove(bullet);
  }

  checkGameOver() {
    consolee.log('Game.checkGameOver', {})
    switch (true) {
      case this.score.getLives() <= 0: {
        this.stop();
        window.dispatchEvent(new GameOverEvent(this.score.getPoints()));
      } break;
      case this.score.getPoints() >= Game.MAX_SCORE_POINTS: {
        this.stop();
        window.dispatchEvent(new GameWinEvent({
          points: this.score.getPoints(),
          lives: this.score.getLives(),
        }));
      } break;
    }
  }

  enableAIControls() {
    consolee.log('Game.enableAIControls', {})
    this.score.setIsAI(true);
  }

  setPlayerType(type) {
    consolee.log('Game.setPlayerType', { type })
    this.isAI = type === NeuralNetwork.NAME;

    if (this.isAI) {
      this.enableAIControls();
    } else {
      this.score.setIsAI(false);
      this.setKeyboardEvents();
    }
  }

  start() {
    consolee.log('Game.start', {})

    if (this.isRunning) return;
    this.isRunning = true;
    this.player.start();
    if (this.isAI && this.nn_manager.neural_networks.length === 0) {
      this.nn_manager.saveGeneration();
    }
    this.update();
    this.asteroidInterval = setInterval(() => this.addAsteroid(), 100);
  }

  addAsteroid() {
    consolee.log('Game.addAsteroid', {})
    if (this.getAsteroids().length < Game.MAX_ASTEROIDS) {
      const asteroid = new AsteroidMesh({
        getPlayer: () => this.player,
        getBullets: () => this.getBullets(),
      });
      asteroid.start();
    }
  }

  addBullet() {
    consolee.log('Game.addBullet', {})
    const bullet = new BulletMesh({
      x: this.player.position.x,
      y: this.player.position.y,
      z: this.player.rotation.z,
      getAsteroids: () => this.getAsteroids()
    });
    bullet.start();
    window.dispatchEvent(new PlayerShotEvent({ player: this.player, bullet }));
  }

  stop() {
    consolee.log('Game.stop', {})
    clearInterval(this.asteroidInterval);
    this.asteroidInterval = null;
    this.isRunning = false;
    if (this.updateFrame !== null) {
      cancelAnimationFrame(this.updateFrame);
      this.updateFrame = null;
    }
  }

  runWithAI() {
    consolee.log('Game.runWithAI', {})

    const input = Array.from(Array(8)).map((_, i) => this.player.getSensorData(i));
    const output = this.nn_manager.activate(input)
    this.runPlayer('left', output[0]);
    this.runPlayer('right', output[1]);
    this.runPlayer('up', output[2]);
    this.runPlayer('down', output[3]);
    this.runPlayer('shoot', output[4]);
  }

  update() {
    consolee.log('Game.update', {})
    if (!this.isRunning) return;
    if (this.isAI) this.runWithAI();

    this.renderer.render(this.scene, this.camera);
    this.updateFrame = requestAnimationFrame(() => this.update());
  }

  reset() {
    consolee.log('Game.reset', {})
    if (this.isAI) {
      this.nn_manager.saveGeneration();
    }
    this.score.reset();
    this.player.stop();
    this.player.resetState();
    this.player.resetPosition().resetRotation();
    this.removeAllBullets();
    this.removeAllAsteroids();
    this.start();
  }

  getAsteroids() {
    consolee.log('Game.getAsteroids', {})
    return this.group.children.filter((asteroid) => asteroid instanceof AsteroidMesh);
  }

  getBullets() {
    consolee.log('Game.getBullets', {})
    return this.group.children.filter((bullet) => bullet instanceof BulletMesh);
  }

  removeAllAsteroids() {
    consolee.log('Game.removeAllAsteroids', {})
    this.getAsteroids().map((asteroid) => {
      asteroid.stop();
      this.group.remove(asteroid);
    });
  }

  removeAllBullets() {
    consolee.log('Game.removeAllBullets', {})
    this.getBullets().map((bullet) => {
      bullet.stop();
      this.group.remove(bullet);
    });
  }
}
