document.body.style.margin = 0;

import { Game } from './game.js'
import { GameOverEvent } from './events/game.over.event.js';

const game = new Game()
game.start()
game.addEventListener(GameOverEvent.NAME, () => {
  alert('Game over! Final Score: ' + game.score.toString());
  game.reset();
})
