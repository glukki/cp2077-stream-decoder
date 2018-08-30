const sharp = require('sharp')

const {
  GRID_POSITION,
  GRID_DIMENSIONS,
  GRID_SPACING,
  CHARACTER_SIZE,
} = require('./constants')

function getCharacterRectangle (x, y) {
  return {
    left: x * (CHARACTER_SIZE.width + GRID_SPACING.x) + GRID_POSITION.left,
    top: y * (CHARACTER_SIZE.height + GRID_SPACING.y) + GRID_POSITION.top,
    ...CHARACTER_SIZE,
  }
}

/**
 * Returns a 2-dimensional array of buffers
 * Every buffer is a greyscale (0-255) representation of the image cell
 * @param {string} path - path to the image
 * @return {Promise<Buffer[][]>}
 */
function getGrid (path) {
  const image = sharp(path)
    .raw()
    .toColourspace('b-w')

  const grid = []
  for (let y = 0; y < GRID_DIMENSIONS.height; y++) {
    const row = []
    for (let x = 0; x < GRID_DIMENSIONS.width; x++) {
      const promise = image.clone()
        .extract(getCharacterRectangle(x, y))
        .toBuffer()
      row.push(promise)
    }
    grid.push(Promise.all(row))
  }

  return Promise.all(grid)
}

module.exports = exports = {
  getGrid,
}
