import { Model } from './model.js'

export class ScoreModel extends Model {
  domElement = document.createElement('div');
  points = -1
  lives = -1
  generation = 0
  isAI = false

  constructor() {
    super();
    this.domElement.id = 'score';
    this.domElement.style.top = '1rem';
    this.domElement.style.left = '1rem';
    this.domElement.style.fontSize = '1rem';
    this.init();
    this.update();
  }

  getPoints() {
    return this.points
  }

  setPoints(points) {
    this.points = points
  }

  getLives() {
    return this.lives
  }

  setLives(lives) {
    this.lives = lives
  }

  setIsAI(isAI = false) {
    this.isAI = isAI
  }

  setGeneration(generation) {
    this.generation = +generation
  }

  getGeneration() {
    return +this.generation
  }

  getScoreText() {
    return [
      `Score: ${this.getPoints()}`,
      `Lives: ${this.getLives()}`,
      this.isAI ? `Generation: ${this.generation}` : null,
    ].filter(Boolean).join(' | ')
  }

  update() {
    this.domElement.textContent = this.getScoreText();
  }

  addPoints(points = 1) {
    this.setPoints(this.getPoints() + +points);
    this.update();
  }

  subtractLife(points = 1) {
    this.setLives(this.getLives() - +points);
    if (this.getLives() < 0) this.setLives(0);
    this.update();
  }

  init() {
    this.setPoints(0);
    this.setLives(10);
  }

  reset() {
    this.init();
    this.update();
  }

  toString() {
    return this.getScoreText()
  }
}
