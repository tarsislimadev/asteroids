import * as THREE from 'three';

const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']

class SensorMesh extends THREE.Mesh {
  constructor(name) {
    consolee.log('SensorMesh.constructor', { name })
    const geometry = new THREE.BoxGeometry(.1, .1, 2);
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
    consolee.log('PlayerMesh.constructor', { createBullet, getAsteroids })
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const colors = new Float32Array([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0]);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    super(geometry, new THREE.MeshBasicMaterial({ vertexColors: true }));

    this.createBullet = createBullet;
    this.getAsteroids = getAsteroids;

    const sensors = [
      [+0, +0, +2],
      [+Math.PI / +4, +2, +1],
      [-Math.PI / +2, +2, +0],
      [-Math.PI / +4, +2, -1],
      [+0, +0, -2],
      [+Math.PI / +4, -2, -1],
      [-Math.PI / +2, -2, +0],
      [-Math.PI / +4, -2, +1],
    ]

    this.sensors.map((_, i) => sensors[i]).map(([ry, px, py], i) => {
      this.sensors[i].rotation.x = -Math.PI / 2
      this.sensors[i].rotation.y = ry
      this.sensors[i].position.x = px
      this.sensors[i].position.y = py
      this.add(this.sensors[i])
    })
  }

  start() {
    consolee.log('PlayerMesh.start', {})
    this.update();
    this.interval = setInterval(() => this.update(), 1e3 / 60);
  }

  update() {
    consolee.log('PlayerMesh.update', {})
    if (this.state.rotateLeft) this.rotateLeft();
    if (this.state.rotateRight) this.rotateRight();
    if (this.state.moveForward) this.moveForward();
    if (this.state.moveBackward) this.moveBackward();
    if (this.state.shoot) this.createBullet?.();
  }

  stop() {
    consolee.log('PlayerMesh.stop', {})
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  startRotateLeft() {
    consolee.log('PlayerMesh.startRotateLeft', {})
    this.state.rotateLeft = 1
  }

  stopRotateLeft() {
    consolee.log('PlayerMesh.stopRotateLeft', {})
    this.state.rotateLeft = 0;
  }

  rotateLeft() {
    consolee.log('PlayerMesh.rotateLeft', {})
    this.rotation.z += 0.1; return this;
  }

  startRotateRight() {
    consolee.log('PlayerMesh.startRotateRight', {})
    this.state.rotateRight = 1;
  }

  stopRotateRight() {
    consolee.log('PlayerMesh.stopRotateRight', {})
    this.state.rotateRight = 0;
  }

  rotateRight() {
    consolee.log('PlayerMesh.rotateRight', {})
    this.rotation.z -= 0.1; return this;
  }

  startMoveForward() {
    consolee.log('PlayerMesh.startMoveForward', {})
    this.state.moveForward = 1;
  }

  stopMoveForward() {
    consolee.log('PlayerMesh.stopMoveForward', {})
    this.state.moveForward = 0;
  }

  moveForward() {
    consolee.log('PlayerMesh.moveForward', {})
    this.position.x += Math.sin(-this.rotation.z) * 0.1;
    this.position.y += Math.cos(-this.rotation.z) * 0.1;
    return this;
  }

  startMoveBackward() {
    consolee.log('PlayerMesh.startMoveBackward', {})
    this.state.moveBackward = 1;
  }

  stopMoveBackward() {
    consolee.log('PlayerMesh.stopMoveBackward', {})
    this.state.moveBackward = 0;
  }

  moveBackward() {
    consolee.log('PlayerMesh.moveBackward', {})
    this.position.x -= Math.sin(-this.rotation.z) * 0.1;
    this.position.y -= Math.cos(-this.rotation.z) * 0.1;
    return this;
  }

  startShot() {
    consolee.log('PlayerMesh.startShot', {})
    this.state.shoot = 1;
  }

  stopShot() {
    consolee.log('PlayerMesh.stopShot', {})
    this.state.shoot = 0;
  }

  resetPosition() {
    consolee.log('PlayerMesh.resetPosition', {})
    this.position.set(0, 0, 0);
    return this;
  }

  resetRotation() {
    consolee.log('PlayerMesh.resetRotation', {})
    this.rotation.set(0, 0, 0);
    return this;
  }

  getSensorData(index) {
    consolee.log('PlayerMesh.getSensorData', { index })
    const boxSensor = new THREE.Box3().setFromObject(this.sensors[index]);
    return this.getAsteroids()
      .map((ast) => new THREE.Box3().setFromObject(ast))
      .some((boxAst) => boxSensor.intersectsBox(boxAst));
  }
}
