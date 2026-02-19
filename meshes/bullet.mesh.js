import * as THREE from 'three';

export class BulletMesh extends THREE.Mesh {
  bullet_direction = new THREE.Vector3();
  bullet_speed = 0.5;

  constructor({ x, y, z } = {}) {
    super(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff9900 })
    )

    this.position.set(x, y, 0);

    this.bullet_direction.set(Math.sin(-z), Math.cos(-z), 0).normalize();

    this.interval_id = setInterval(() => this.updateBullet(), 16);
  }

  checkOutside() {
    const outside_x = Math.abs(this.position.x) > 100;
    const outside_y = Math.abs(this.position.y) > 100;
    if (outside_x || outside_y) {
      this.dispatchEvent(new CustomEvent('bullet.outside', { detail: { bullet: this } }));
    }
  }

  updateBullet() {
    this.position.addScaledVector(this.bullet_direction, this.bullet_speed);
    this.checkOutside();
  }
}
