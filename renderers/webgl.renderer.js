import * as THREE from 'three';

export class WebGLRenderer extends THREE.WebGLRenderer {
  constructor() {
    super({ antialias: true });
    this.setPixelRatio(window.devicePixelRatio);
    this.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.domElement);
  }
}
