import * as THREE from 'three';

export class WebGLRenderer extends THREE.WebGLRenderer {
  constructor() {
    super({ antialias: true });
    this.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.domElement);
  }
}
