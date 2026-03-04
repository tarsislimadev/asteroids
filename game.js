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

  isAI = false;
  neural_networks = [];
  inputs_outputs = [];

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

    window.addEventListener('resize', () => {
      consolee.log('Game.setWindowEvents.resize', {})
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener(GameOverEvent.NAME, () => {
      consolee.log('Game.setWindowEvents.GameOverEvent', {})
      alert('Game over! ' + this.score.toString());
      this.reset();
    })

    window.addEventListener(GameWinEvent.NAME, () => {
      consolee.log('Game.setWindowEvents.GameWinEvent', {})
      alert('You won! ' + this.score.toString());
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
        window.dispatchEvent(new GameWinEvent(this.score.getPoints()));
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
      this.setKeyboardEvents();
    }
  }

  getWeights() {
    // this.neural_networks[].layers.hidden[].list[].connections.inputs[].weight
  }

  start() {
    consolee.log('Game.start', {})

    this.player.start();

    this.neural_networks.push(this.createNeuralNetwork())
    this.score.setGeneration(this.neural_networks.length)

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
  }

  getNeuralNetwork() {
    consolee.log('Game.getNeuralNetwork', {})
    return this.neural_networks[this.neural_networks.length - 1]
  }

  runWithAI() {
    consolee.log('Game.runWithAI', {})

    const nn = this.getNeuralNetwork();

    const input = Array.from(Array(8)).map((_, i) => this.player.getSensorData(i));
    const output = nn.activate(input).map((value) => value >= 0.5);

    const expect_output = [output[0] || 1, output[1] || 1, output[2] || 1, output[3] || 1, output[4] || 0];
    nn.propagate(0.5, expect_output);

    this.runPlayer('left', output[0]);
    this.runPlayer('right', output[1]);
    this.runPlayer('up', output[2]);
    this.runPlayer('down', output[3]);
    this.runPlayer('shoot', output[4]);

    // Maintain a rolling history of the last 1000 input/output pairs for training or analysis
    this.inputs_outputs = [...this.inputs_outputs.slice(-999), { input, output }];
  }

  update() {
    consolee.log('Game.update', {})
    if (this.isAI) this.runWithAI();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.update());
  }

  reset() {
    consolee.log('Game.reset', {})
    this.score.reset();
    this.player.stop();
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
    const net = new synaptic.Network({
      input: inputLayer,
      hidden: [hiddenLayer1, hiddenLayer2, hiddenLayer3],
      output: outputLayer,
    });

    if (this.inputs_outputs.length > 0) {
      const trainer = new synaptic.Trainer(net);
      trainer.train(this.inputs_outputs)
    }

    return net;
  }
}
