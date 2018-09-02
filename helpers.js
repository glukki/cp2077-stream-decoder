const {CHARACTER_SIZE} = require('./constants')
const COMPARISON_SEQUENCE = (() => {
  const characterBufferLength = CHARACTER_SIZE.width * CHARACTER_SIZE.height

  let sequence = []
  for (let index = 0; index < characterBufferLength; index++) {
    sequence.push([Math.random(), index])
  }

  return sequence.sort((a, b) => a[0] - b[0])
    .map(([weight, index]) => index)
})()

/**
 * Returns a console-printable string representation of a greyscale image
 * @param {Buffer} buf
 * @return {string}
 */
function getBufferString (buf) {
  const arr = Array.from(buf)
    .map(pixel => {
      if (pixel > 127) {return 'X'}
      if (pixel > 0) { return '+'}
      return ' '
    })

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

function areSimilar (imageA, imageB, threshold) {
  let diff = 0
  for (let i = 0; i < COMPARISON_SEQUENCE.length; i++) {
    const index = COMPARISON_SEQUENCE[i]
    diff += Math.abs(imageA[index] - imageB[index])
    if (diff >= threshold) {
      return false
    }
  }
  return true
}

module.exports = exports = {
  getBufferString,
  getDifference,
  areSimilar,
}
