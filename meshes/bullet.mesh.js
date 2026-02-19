import * as THREE from 'three';

class BulletConfig {
  static get speed() { return 0.5 }
}

export class BulletMesh extends THREE.Mesh {
  bullet_direction = new THREE.Vector3();
  interval_id = null;

  constructor({ x, y, z } = {}) {
    super(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff9900 })
    )

    this.position.set(x, y, 0);

    this.bullet_direction.set(Math.sin(-z), Math.cos(-z), 0).normalize();
  }

  checkOutside() {
    const outside_x = Math.abs(this.position.x) > 100;
    const outside_y = Math.abs(this.position.y) > 100;
    if (outside_x || outside_y) {
      this.dispatchEvent({ type: 'bullet.outside', detail: { bullet: this } });
      this.stop();
    }
  }

  start() {
    this.interval_id = setInterval(() => this.updateBullet(), 16);
  }

  stop() {
    if (this.interval_id) {
      clearInterval(this.interval_id);
      this.interval_id = null;
    }
  }

  updateBullet() {
    this.position.addScaledVector(this.bullet_direction, BulletConfig.speed);
    this.checkOutside();
  }
}
