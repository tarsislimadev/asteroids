const random = (max, min = 0, floor = true) => Math[floor ? 'floor' : 'abs'](max * Math.random()) + min;

export { random };
