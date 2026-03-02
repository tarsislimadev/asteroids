import * as THREE from 'three';
import { random, generateDirection, generatePosition } from '../utils.js';
import { AsteroidConfig } from '../config/asteroid.config.js';
import { PlayerCollisionEvent } from '../events/player.asteroid.collision.event.js';
import { AsteroidBulletCollisionEvent } from '../events/asteroid.bullet.collision.event.js';
import { AsteroidOutsideEvent } from '../events/asteroid.outside.event.js';
import { AsteroidCreatedEvent } from '../events/asteroid.created.event.js';

export class AsteroidMesh extends THREE.Mesh {
  static SPEED = 1

  direction = new THREE.Vector3();

  getters = {
    getPlayer: null,
    getBullets: null,
  }

  interval_id = null;

  constructor({ getPlayer, getBullets } = {}) {
    super(
      new THREE.CircleGeometry(AsteroidConfig.radius, 5.0),
      new THREE.MeshBasicMaterial({ color: AsteroidConfig.color })
    );

    this.getters.getPlayer = getPlayer;
    this.getters.getBullets = getBullets;

    const side = random(4);

    this.position.set(...generatePosition(side), -0.1);

    this.direction.set(...generateDirection(side), 0).normalize();

    window.dispatchEvent(new AsteroidCreatedEvent({ asteroid: this }));
  }

  checkPlayerCollision() {
    const distance = this.position.distanceTo(this.getters.getPlayer().position);
    if (distance < AsteroidConfig.radius) {
      this.stop();
      window.dispatchEvent(new PlayerCollisionEvent({ asteroid: this }));
    }
  }

  checkBulletsCollisions() {
    this.getters.getBullets().map(bullet => {
      const distance = this.position.distanceTo(bullet.position);
      if (distance < AsteroidConfig.radius) {
        this.stop();
        window.dispatchEvent(new AsteroidBulletCollisionEvent({ bullet, asteroid: this }));
      }
    });
  }

  checkOutside() {
    const xFar = Math.abs(this.position.x) > AsteroidConfig.far
    const yFar = Math.abs(this.position.y) > AsteroidConfig.far
    if (xFar || yFar) {
      window.dispatchEvent(new AsteroidOutsideEvent({ asteroid: this }));
      this.stop();
    }
  }

  start() {
    this.asteroidUpdate();
    this.interval_id = setInterval(() => this.asteroidUpdate(), 500);
  }

  stop() {
    clearInterval(this.interval_id);
  }

  asteroidUpdate() {
    this.position.addScaledVector(this.direction, AsteroidMesh.SPEED);
    this.checkPlayerCollision();
    this.checkBulletsCollisions();
    this.checkOutside();
  }
}
