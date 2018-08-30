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

module.exports = exports = {
  getBufferString,
}
