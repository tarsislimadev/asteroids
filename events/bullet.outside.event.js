export class BulletOutsideEvent extends CustomEvent {
  static NAME = 'bullet.outside'

  constructor({ bullet } = {}) {
    super(BulletOutsideEvent.NAME, { detail: { bullet } })
  }
}
