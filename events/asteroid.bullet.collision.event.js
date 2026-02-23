export class AsteroidBulletCollisionEvent extends CustomEvent {
  static NAME = 'asteroid.bullet.collision'

  constructor({ bullet, asteroid } = {}) {
    super(AsteroidBulletCollisionEvent.NAME, { detail: { bullet, asteroid } })
  }
}
