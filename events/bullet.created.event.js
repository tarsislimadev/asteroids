export class BulletCreatedEvent extends CustomEvent {
  static NAME = 'bullet.created'

  constructor({ bullet } = {}) {
    super(BulletCreatedEvent.NAME, { detail: { bullet } })
  }
}
