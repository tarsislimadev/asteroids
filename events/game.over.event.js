export class GameOverEvent extends CustomEvent {
  static NAME  = 'game.over'

  constructor(score) {
    super(GameOverEvent.NAME, { detail: { score } });
  }
}
