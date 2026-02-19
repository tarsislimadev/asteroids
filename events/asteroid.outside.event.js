export class AsteroidOutsideEvent extends CustomEvent {
  static NAME = 'asteroid.outside'

  constructor({ asteroid } = {}) {
    super(AsteroidOutsideEvent.NAME, { detail: { asteroid } })
  }
}
