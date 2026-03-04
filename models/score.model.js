import { Model } from './model.js'

export class ScoreModel extends Model {
  domElement = document.createElement('div');
  points = -1
  lives = -1
  generation = 0
  isAI = false

  constructor() {
    consolee.log('ScoreModel.constructor', {})
    super();
    this.domElement.id = 'score';
    this.domElement.style.top = '1rem';
    this.domElement.style.left = '1rem';
    this.domElement.style.fontSize = '1rem';
    this.init();
    this.update();
  }

  getPoints() {
    consolee.log('ScoreModel.getPoints', {})
    return this.points
  }

  setPoints(points) {
    consolee.log('ScoreModel.setPoints', {})
    this.points = points
  }

  getLives() {
    consolee.log('ScoreModel.getLives', {})
    return this.lives
  }

  setLives(lives) {
    consolee.log('ScoreModel.setLives', {})
    this.lives = lives
  }

  setIsAI(isAI = false) {
    consolee.log('ScoreModel.setIsAI', {})
    this.isAI = isAI
  }

  setGeneration(generation) {
    consolee.log('ScoreModel.setGeneration', {})
    this.generation = +generation
  }

  getGeneration() {
    consolee.log('ScoreModel.getGeneration', {})
    return +this.generation
  }

  getScoreText() {
    consolee.log('ScoreModel.getScoreText', {})
    return [
      `Score: ${this.getPoints()}`,
      `Lives: ${this.getLives()}`,
      this.isAI ? `Generation: ${this.generation}` : null,
    ].filter(Boolean).join(' | ')
  }

  update() {
    consolee.log('ScoreModel.update', {})
    this.domElement.textContent = this.getScoreText();
  }

  addPoints(points = 1) {
    consolee.log('ScoreModel.addPoints', {})
    this.setPoints(this.getPoints() + +points);
    this.update();
  }

  subtractLife(points = 1) {
    consolee.log('ScoreModel.subtractLife', { points })
    this.setLives(this.getLives() - +points);
    if (this.getLives() < 0) this.setLives(0);
    this.update();
  }

  init() {
    consolee.log('ScoreModel.init', {})
    this.setPoints(0);
    this.setLives(10);
  }

  reset() {
    consolee.log('ScoreModel.reset', {})
    this.init();
    this.update();
  }

  toString() {
    consolee.log('ScoreModel.toString', {})
    return this.getScoreText()
  }
}
