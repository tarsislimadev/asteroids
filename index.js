document.body.style.margin = 0;

import { Game } from './game.js'
import { NeuralNetwork } from './neural.network.js';

const game = new Game(400, 400);

const createButton = (text, onclick = () => console.log('not implemented')) => {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.addEventListener('click', () => onclick());
  return btn;
}

const humanButton = createButton('Human', () => {
  game.start('human')
  buttons.remove();
});

const aiButton = createButton(NeuralNetwork.NAME, () => {
  game.start(NeuralNetwork.NAME)
  buttons.remove();
});

const buttons = document.createElement('div');
buttons.style.display = 'flex';
buttons.style.justifyContent = 'space-between';
buttons.style.width = '100%';
buttons.appendChild(humanButton);
buttons.appendChild(aiButton);

const app = document.getElementById('app');
app.appendChild(buttons);
app.appendChild(game.renderer.domElement);
app.appendChild(game.score.domElement);
