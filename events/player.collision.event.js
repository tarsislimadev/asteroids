export class PlayerCollisionEvent extends CustomEvent {
  static NAME = 'player.collision'

  constructor({ player, asteroid } = {}) {
    super(PlayerCollisionEvent.NAME, { detail: { player, asteroid } })
  }
}
