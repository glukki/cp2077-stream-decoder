const fs = require('fs')
const promisify = require('util').promisify
const {TEXTS_PATH, GRID_DIMENSIONS} = require('./constants')

function areEqual (strA, strB) {
  return strA.split('')
    .every((charA, index) => {
      const charB = strB[index]
      if (charA === 'l' && charB === 'I') {
        return true
      }
      if (charA === 'I' && charB === 'l') {
        return true
      }
      return charA === charB
    })
}

async function mergeTexts () {
  const fsReaddir = promisify(fs.readdir)
  const fsReadFile = promisify(fs.readFile)
  const fsWriteFile = promisify(fs.writeFile)

  const textExtension = '.txt'

  const files = (await fsReaddir(TEXTS_PATH))
    .filter(name => name.endsWith(textExtension))

  const texts = (await Promise.all(files.map(fileName => fsReadFile(`${TEXTS_PATH}${fileName}`, 'ascii'))))
    .map(text => text.split('\n'))

  const mergedText = texts.reduce((out, file) => {
    file.forEach(line => {
      const isDuplicate = out.slice(-GRID_DIMENSIONS.height)
        .some(outLine => areEqual(outLine, line))

      if (!isDuplicate) {
        out.push(line)
      }
    })
    return out
  }, [])

  await fsWriteFile('./result.txt', mergedText.join('\n'))
  await fsWriteFile('./result.png', Buffer.from(mergedText.join('') + '=', 'base64'))
}

mergeTexts()
  .then()
