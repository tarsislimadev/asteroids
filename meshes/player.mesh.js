import * as THREE from 'three';
import { BulletMesh } from './bullet.mesh.js';

export class PlayerMesh extends THREE.Mesh {
  state = { shoot: 0, rotateRight: 0, rotateLeft: 0, moveForward: 0, moveBackward: 0, }

  bullets = [];

  rotationInterval = null;
  forwardMoveInterval = null;
  backwardMoveInterval = null;
  shotInterval = null;

  constructor() {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const colors = new Float32Array([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0]);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    super(geometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
  }

  start() {
    this.interval = setInterval(() => {
      if (this.state.rotateLeft) this.rotateLeft()
      if (this.state.rotateRight) this.rotateRight()
      if (this.state.moveForward) this.moveForward()
      if (this.state.moveBackward) this.moveBackward()
      if (this.state.shoot) this.shot()
    }, 1e3 / 60);
  }

  startRotateLeft() { this.state.rotateLeft = 1 }

  stopRotateLeft() { this.state.rotateLeft = 0; }

  rotateLeft() { this.rotation.z += 0.1; return this; }

  startRotateRight() { this.state.rotateRight = 1; }

  stopRotateRight() { this.state.rotateRight = 0; }

  rotateRight() { this.rotation.z -= 0.1; return this; }

  startMoveForward() { this.state.moveForward = 1; }

  stopMoveForward() { this.state.moveForward = 0; }

  moveForward() {
    this.position.x += Math.sin(-this.rotation.z) * 0.1;
    this.position.y += Math.cos(-this.rotation.z) * 0.1;
    return this;
  }

  startMoveBackward() { this.state.moveBackward = 1; }

  stopMoveBackward() { this.state.moveBackward = 0; }

  moveBackward() {
    this.position.x -= Math.sin(-this.rotation.z) * 0.1;
    this.position.y -= Math.cos(-this.rotation.z) * 0.1;
    return this;
  }

  startShot() { this.state.shoot = 1; }

  stopShot() { this.state.shoot = 0; }

  shot() {
    const bullet = this.createBullet();
    this.bullets.push(bullet);
    this.dispatchEvent(new CustomEvent('player.shot', { detail: { bullet } }));
    return bullet;
  }

  resetPosition() {
    this.position.set(0, 0, 0);
    return this;
  }

  resetRotation() {
    this.rotation.set(0, 0, 0);
    return this;
  }

  createBullet() {
    const { x, y } = this.position;
    const { z } = this.rotation;
    return new BulletMesh({ x, y, z, group: this.group });
  }

  removeAllBullets() {
    this.bullets.map((bullet) => this.group.remove(bullet));
    this.bullets = [];
    return this;
  }
}
