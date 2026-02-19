import { Model } from './model.js'

export class ScoreModel extends Model {
  points = 0
  lives = 10

  domElement = document.createElement('div');

  constructor() {
    super();
    this.domElement.id = 'score';
    this.domElement.style.position = 'fixed';
    this.domElement.style.top = '1rem';
    this.domElement.style.left = '1rem';
    this.domElement.style.fontSize = '2rem';
    this.domElement.style.color = '#ffffff';
    document.body.appendChild(this.domElement);
    this.update();
  }

  update() {
    this.domElement.textContent = `Score: ${this.points} | Lives: ${this.lives}`;
  }

  addPoints(points) {
    this.points += points;
    this.update();
  }

  subtractLife(points) {
    this.lives -= points;
    if (this.lives < 0) this.lives = 0;
    this.update();
  }
}
