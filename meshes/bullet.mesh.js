import * as THREE from 'three';
import { BulletCreatedEvent } from '../events/bullet.created.event.js'
import { BulletOutsideEvent } from '../events/bullet.outside.event.js'

class BulletConfig {
  static get speed() { return 0.5 }
}

export class BulletMesh extends THREE.Mesh {
  bullet_direction = new THREE.Vector3();
  interval_id = null;

  group = null;

  constructor({ x, y, z, group = {} } = {}) {
    super(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff9900 })
    )

    this.group = group;
    this.position.set(x, y, 0);
    this.bullet_direction.set(Math.sin(-z), Math.cos(-z), 0).normalize();

    window.dispatchEvent(new BulletCreatedEvent({ bullet: this }))
  }

  checkOutside() {
    const outside_x = Math.abs(this.position.x) > 100;
    const outside_y = Math.abs(this.position.y) > 100;
    if (outside_x || outside_y) {
      this.stop();
      window.dispatchEvent(new BulletOutsideEvent({ bullet: this }))
    }
  }

  start() {
    this.updateBullet();
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
