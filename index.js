document.body.style.margin = 0;

import { Game } from './game.js'

const game = new Game()
game.start()
game.addEventListener('game_over', () => {
  alert('Game over! Final Score: ' + game.score.toString());
  game.reset();
})
