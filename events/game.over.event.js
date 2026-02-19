export class GameOverEvent extends CustomEvent {
  constructor(score) {
    super('game_over', { detail: { score } });
  }
}
