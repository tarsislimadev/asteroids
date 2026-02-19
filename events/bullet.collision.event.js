export class BulletCollisionEvent extends CustomEvent {
  static NAME = 'bullet.collision'

  constructor({ bullet, asteroid } = {}) {
    super(BulletCollisionEvent.NAME, { detail: { bullet, asteroid } })
  }
}
