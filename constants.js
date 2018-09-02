const IMAGE_DIMENSIONS = {
  width: 1920,
  height: 1080,
}
const GRID_POSITION = {
  top: 1,
  left: 271,
}
const GRID_DIMENSIONS = {
  width: 72,
  height: 27 - 1, // skip last line, as it may be incomplete
}
const GRID_SPACING = {
  x: 1,
  y: 8,
}
const CHARACTER_SIZE = {
  width: 19,
  height: 32,
}
const DICTIONARY_SIZE = 64
const DICTIONARY_PATH = './dict/'
const TEXTS_PATH = './texts/'

module.exports = exports = {
  IMAGE_DIMENSIONS,
  GRID_POSITION,
  GRID_DIMENSIONS,
  GRID_SPACING,
  CHARACTER_SIZE,
  DICTIONARY_SIZE,
  DICTIONARY_PATH,
  TEXTS_PATH,
}
