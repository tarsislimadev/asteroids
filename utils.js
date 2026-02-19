export const random = (max, min = 0, floor = true) => Math[floor ? 'floor' : 'abs'](max * Math.random()) + min;

export const generatePosition = (side) => {
  switch (side) {
    case 0: return [random(10, -5), 10]  // Top
    case 1: return [random(10, -5), -10]  // Bottom
    case 2: return [10, random(10, -5)]  // Right
    case 3: return [-10, random(10, -5)]  // Left
  }
  return [0, 0]
}

export const generateDirection = (side) => {
  switch (side) {
    case 0: return [random(2, -1, false), random(-1, -2, false)]  // Top
    case 1: return [random(2, -1, false), random(1, 2, false)]  // Bottom
    case 2: return [random(-1, -2, false), random(2, -1, false)]  // Right
    case 3: return [random(1, 2, false), random(2, -1, false)]  // Left
  }
  return [0, 0]
}
