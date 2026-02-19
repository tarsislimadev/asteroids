import * as THREE from 'three';
import { BulletMesh } from './bullet.mesh.js';
import { random } from '../utils.js';

export class AsteroidMesh extends THREE.Mesh {
  asteroid_speed = 0.5
  asteroid_direction = new THREE.Vector3();

  game_player = null;
  group = null;

  interval_id = null;

  constructor({ player = null, group = null } = {}) {
    const asteroid_radius = 0.5
    const asteroid_color = 0xffffff

    super(
      new THREE.CircleGeometry(asteroid_radius, 5.0),
      new THREE.MeshBasicMaterial({ color: asteroid_color })
    );

    this.game_player = player;
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
    // Check for collision with triangle
    const distance = this.position.distanceTo(this.game_player.position);
    if (distance < this.asteroid_radius) { // Collision threshold
      this.dispatchEvent(new CustomEvent('asteroid.collision', { detail: { asteroid: this } }));
      this.stop();
    }
  }

  checkBulletsCollisions() {
    // Check for collision with bullets
    this.group.children.forEach(child => {
      if (child instanceof BulletMesh) {
        const distance = this.position.distanceTo(child.position);
        if (distance < this.asteroid_radius) { // Collision threshold
          this.dispatchEvent(new CustomEvent('asteroid.bullet_collision', { detail: { asteroid: this, bullet: child } }));
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
    // Remove ast if it goes too far
    if (Math.abs(this.position.x) > 100 || Math.abs(this.position.y) > 100) {
      this.dispatchEvent(new CustomEvent('asteroid.outside', { detail: { asteroid: this } }));
      this.stop();
    }
  }

  start() {
    this.asteroidUpdate()
    setInterval(() => this.asteroidUpdate(), 500);
  }

  asteroidUpdate() {
    this.position.addScaledVector(this.asteroid_direction, this.asteroid_speed);
    this.checkCollisions();
    this.checkSoFar();
  }
}
