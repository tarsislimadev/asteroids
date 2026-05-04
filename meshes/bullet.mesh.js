import * as THREE from 'three';
import { BulletCreatedEvent } from '../events/bullet.created.event.js'
import { BulletOutsideEvent } from '../events/bullet.outside.event.js'
import { AsteroidBulletCollisionEvent } from '../events/asteroid.bullet.collision.event.js'
import { AsteroidConfig } from '../config/asteroid.config.js'
import { BulletConfig } from '../config/bullet.config.js'

export class BulletMesh extends THREE.Mesh {
  direction = new THREE.Vector3();
  interval_id = null;

  getAsteroids = null

  constructor({ x, y, z, getAsteroids = () => console.error(new Error('not implemented')) } = {}) {
    super(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff9900 })
    )

    this.getAsteroids = getAsteroids

    this.position.set(x, y, 0);
    this.direction.set(Math.sin(-z), Math.cos(-z), 0).normalize();

    window.dispatchEvent(new BulletCreatedEvent({ bullet: this }))
  }

  checkOutside() {
    const xFar = Math.abs(this.position.x) > BulletConfig.far;
    const yFar = Math.abs(this.position.y) > BulletConfig.far;
    if (xFar || yFar) {
      this.stop();
      window.dispatchEvent(new BulletOutsideEvent({ bullet: this }))
    }
  }

  start() {
    this.update();
    this.interval_id = setInterval(() => this.update(), 1e3 / 30);
  }

  stop() {
    clearInterval(this.interval_id);
  }

  checkCollisions() {
    for (const asteroid of this.getAsteroids()) {
      const distance = this.position.distanceTo(asteroid.position);
      if (distance < AsteroidConfig.radius) {
        this.stop();
        window.dispatchEvent(new AsteroidBulletCollisionEvent({ asteroid, bullet: this }));
        return;
      }
    }
  }

  update() {
    this.position.addScaledVector(this.direction, BulletConfig.speed);
    this.checkCollisions();
    this.checkOutside();
  }
}
