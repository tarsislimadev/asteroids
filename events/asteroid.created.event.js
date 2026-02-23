export class AsteroidCreatedEvent extends CustomEvent {
  static NAME = 'asteroid-created'

  constructor({ asteroid } = {}) {
    super(AsteroidCreatedEvent.NAME, { detail: { asteroid } })
  }
}
