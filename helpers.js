const {CHARACTER_SIZE} = require('./constants')

/**
 * Returns a console-printable string representation of a greyscale image
 * @param {Buffer} buf
 * @return {string}
 */
function getBufferString (buf) {
  const arr = Array.from(buf)
    .map(pixel => pixel > 127 ? 'x' : ' ')

  let result = []
  for (let i = 0; i < CHARACTER_SIZE.height; i++) {
    const row = arr
      .slice(i * CHARACTER_SIZE.width, (i + 1) * CHARACTER_SIZE.width)
      .join(' ')
    result.push(row)
  }
  return result.join('\n')
}

/**
 * Compute a total color difference between 2 images
 * @param {Buffer} imageA
 * @param {Buffer} imageB
 * @return {number}
 */
function getDifference (imageA, imageB) {
  let diff = 0
  for (let i = 0; i < imageA.length; i++) {
    diff += Math.abs(imageA[i] - imageB[i])
  }
  return diff
}

module.exports = exports = {
  getBufferString,
  getDifference,
}
