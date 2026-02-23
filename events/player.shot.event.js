export class PlayerShotEvent extends CustomEvent {
  static NAME = 'player.shot'

  constructor({ player, bullet } = {}) {
    super(PlayerShotEvent.NAME, { detail: { player, bullet } })
  }
}
