export class GameWinEvent extends CustomEvent {
  constructor({ points, lives } = {}) {
    super()
    this.points = points
    this.lives = lives
  }
}
