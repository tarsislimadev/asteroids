export class AsteroidCreatedEvent extends CustomEvent {
  constructor(asteroid) {
    super('asteroid-created', { detail: { asteroid } })
  }
}
