import * as THREE from 'three';

export class AmbientLight extends THREE.AmbientLight {
  constructor({ } = {}) {
    super(0xffffff, 0.5);
  }
}
