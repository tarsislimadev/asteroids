import * as THREE from 'three';

const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']

class SensorMesh extends THREE.Mesh {
  constructor(name) {
    const geometry = new THREE.BoxGeometry(.1, .1, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    super(geometry, material)
    this.userData['name'] = name;
  }
}

export class PlayerMesh extends THREE.Mesh {
  state = { shoot: 0, rotateRight: 0, rotateLeft: 0, moveForward: 0, moveBackward: 0, }

  createBullet = null;

  getAsteroids = null;

  rotationInterval = null;
  forwardMoveInterval = null;
  backwardMoveInterval = null;
  shotInterval = null;

  sensors = Array.from(Array(8)).map((_, i) => new SensorMesh(directions[i]))

  constructor({ createBullet, getAsteroids } = {}) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const colors = new Float32Array([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0]);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    super(geometry, new THREE.MeshBasicMaterial({ vertexColors: true }));

    this.createBullet = createBullet;
    this.getAsteroids = getAsteroids;

    this.sensors.map((s, index) => {
      const angle = (index * 2 * Math.PI) / this.sensors.length;
      s.rotation.x = Math.PI;
      s.rotation.z = angle;
      this.add(s)
    })
  }

  start() {
    this.update();
    this.interval = setInterval(() => this.update(), 1e3 / 60);
  }

  update() {
    if (this.state.rotateLeft) this.rotateLeft();
    if (this.state.rotateRight) this.rotateRight();
    if (this.state.moveForward) this.moveForward();
    if (this.state.moveBackward) this.moveBackward();
    if (this.state.shoot) this.createBullet?.();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
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

  resetPosition() {
    this.position.set(0, 0, 0);
    return this;
  }

  resetRotation() {
    this.rotation.set(0, 0, 0);
    return this;
  }

  getSensorData(index) {
    const boxSensor = new THREE.Box3().setFromObject(this.sensors[index]);
    return this.getAsteroids()
      .map((ast) => new THREE.Box3().setFromObject(ast))
      .some((boxAst) => boxSensor.intersectsBox(boxAst));
  }
}
