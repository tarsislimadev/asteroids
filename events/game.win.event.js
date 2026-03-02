export class GameWinEvent extends CustomEvent {
  static NAME = 'game.win'

  constructor({ points, lives } = {}) {
    super(GameWinEvent.NAME, { detail: { points, lives } })
    this.points = points
    this.lives = lives
  }
}
