export class PlayerShotEvent extends CustomEvent {
  static NAME = 'player.shot'

  constructor({ player } = {}) {
    super(PlayerShotEvent.NAME, { detail: { player } })
  }
}
