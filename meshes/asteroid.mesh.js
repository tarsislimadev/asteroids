import * as THREE from 'three';

import { BulletMesh } from './bullet.mesh.js';

import { random, generateDirection, generatePosition } from '../utils.js';

import { AsteroidConfig } from '../config/asteroid.config.js'

import { PlayerCollisionEvent } from '../events/player.collision.event.js';
import { BulletCollisionEvent } from '../events/bullet.collision.event.js'
import { AsteroidOutsideEvent } from '../events/asteroid.outside.event.js'

export class AsteroidMesh extends THREE.Mesh {
  asteroid_direction = new THREE.Vector3();

  player = null;
  group = null;

  interval_id = null;

  constructor({ player = null, group = null } = {}) {
    super(
      new THREE.CircleGeometry(AsteroidConfig.radius, 5.0),
      new THREE.MeshBasicMaterial({ color: AsteroidConfig.color })
    );

    this.player = player;
    this.group = group;

    const side = random(4);

    const position = generatePosition(side);
    this.position.set(position[0], position[1], -0.1);

    this.asteroid_direction.set(...generateDirection(side), 0).normalize();
  }

  checkPlayerCollision() {
    const distance = this.position.distanceTo(this.player.position);
    if (distance < AsteroidConfig.radius) {
      this.dispatchEvent(new PlayerCollisionEvent({ player: this.player, asteroid: this }));
      this.stop();
    }
  }

  checkBulletsCollisions() {
    this.group.children.map(child => {
      if (child instanceof BulletMesh) {
        const distance = this.position.distanceTo(child.position);
        if (distance < AsteroidConfig.radius) {
          this.dispatchEvent(new BulletCollisionEvent());
          this.stop();
        }
      }
    });
  }

  checkCollisions() {
    this.checkPlayerCollision()
    this.checkBulletsCollisions()
  }

  checkSoFar() {
    const xFar = Math.abs(this.position.x) > AsteroidConfig.far
    const yFar = Math.abs(this.position.y) > AsteroidConfig.far

    if (xFar || yFar) {
      this.dispatchEvent(new AsteroidOutsideEvent({ asteroid: this }));
      this.stop();
    }
  }

  start() {
    this.asteroidUpdate();
    this.interval_id = setInterval(() => this.asteroidUpdate(), 500);
  }

  stop() {
    if (this.interval_id) {
      clearInterval(this.interval_id);
      this.interval_id = null;
    }
  }

  asteroidUpdate() {
    this.position.addScaledVector(this.asteroid_direction, this.asteroid_speed);
    this.checkCollisions();
    this.checkSoFar();
  }
}
