export class BulletCreatedEvent extends Event {
  static NAME = 'bullet.created'

  constructor({ bullet } = {}) {
    super(BulletCreatedEvent.NAME, { detail: { bullet } })
  }
}
