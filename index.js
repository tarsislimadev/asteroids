document.body.style.margin = 0;

import { Game } from './game.js'
import { GameOverEvent } from './events/game.over.event.js';

const game = new Game(400, 400);

game.start();

window.addEventListener(GameOverEvent.NAME, () => {
  alert('Game over! Final Score: ' + game.score.toString());
  game.reset();
})

const app = document.getElementById('app');
app.appendChild(game.renderer.domElement);
app.appendChild(game.score.domElement);
