import * as THREE from 'three';
import { BulletMesh } from './bullet.mesh.js';
import { random } from '../utils.js';

class AsteroidConfig {
  static get speed() { return 0.5 }
  static get radius() { return 0.5 }
  static get color() { return 0xffffff }

  static get far() { return 100 }
}

class PlayerCollisionEvent extends CustomEvent {
  constructor({ player, asteroid } = {}) {
    super('player.collision', { detail: { player, asteroid } })
  }
}

class BulletCollisionEvent extends CustomEvent {
  constructor({ bullet, asteroid } = {}) {
    super('bullet.collision', { detail: { bullet, asteroid } })
  }
}

class AsteroidOutsideEvent extends CustomEvent {
  constructor({ asteroid } = {}) {
    super('asteroid.outside', { detail: { asteroid } })
  }
}

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

    const position = this.generatePosition(side);
    this.position.set(position[0], position[1], -0.1);

    this.asteroid_direction.set(...this.generateDirection(side), 0).normalize();
  }

  generatePosition(side) {
    switch (side) {
      case 0: return [random(10, -5), 10]  // Top
      case 1: return [random(10, -5), -10]  // Bottom
      case 2: return [10, random(10, -5)]  // Right
      case 3: return [-10, random(10, -5)]  // Left
    }
    return [0, 0]
  }

  generateDirection(side) {
    switch (side) {
      case 0: return [random(2, -1, false), random(-1, -2, false)]  // Top
      case 1: return [random(2, -1, false), random(1, 2, false)]  // Bottom
      case 2: return [random(-1, -2, false), random(2, -1, false)]  // Right
      case 3: return [random(1, 2, false), random(2, -1, false)]  // Left
    }
    return [0, 0]
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
