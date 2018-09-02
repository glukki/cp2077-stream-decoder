const sharp = require('sharp')

const {
  IMAGE_DIMENSIONS,
  GRID_POSITION,
  GRID_DIMENSIONS,
  GRID_SPACING,
  CHARACTER_SIZE,
} = require('./constants')

/**
 * @param x
 * @param y
 * @return {{left: number, top: number, width: number, height: number}}
 */
function getCharacterRectangle (x, y) {
  return {
    left: x * (CHARACTER_SIZE.width + GRID_SPACING.x) + GRID_POSITION.left,
    top: y * (CHARACTER_SIZE.height + GRID_SPACING.y) + GRID_POSITION.top,
    ...CHARACTER_SIZE,
  }
}

/**
 * @param {Buffer} image
 * @return {Buffer}
 */
function mapImageToThreeColors (image) {
  return image.map(pixel => {
    if (pixel > 170) {return 255}
    if (pixel > 85) {return 127}
    return 0
  })
}

/**
 * @param {Buffer} image
 * @param {number} x
 * @param {number} y
 * @return {Buffer}
 */
function extractImage (image, x, y) {
  const dimensions = getCharacterRectangle(x, y)

  const rows = []
  const characterStart = (dimensions.top * IMAGE_DIMENSIONS.width + dimensions.left)
  for (let i = 0; i < dimensions.height; i++) {
    const rowStart = characterStart + i * IMAGE_DIMENSIONS.width
    const row = image.slice(rowStart, rowStart + dimensions.width)
    rows.push(row)
  }

  return Buffer.concat(rows)
}

/**
 * Returns a 2-dimensional array of buffers
 * Every buffer is a greyscale (0-255) representation of the image cell
 * @param {string} path - path to the image
 * @return {Promise<Buffer[][]>}
 */
async function getGrid (path) {
  const image = mapImageToThreeColors(await sharp(path)
    .raw()
    .toColourspace('b-w')
    .toBuffer())

  const grid = []
  for (let y = 0; y < GRID_DIMENSIONS.height; y++) {
    const row = []
    for (let x = 0; x < GRID_DIMENSIONS.width; x++) {
      row.push(extractImage(image, x, y))
    }
    grid.push(row)
  }

  return grid
}

module.exports = exports = {
  getGrid,
}
