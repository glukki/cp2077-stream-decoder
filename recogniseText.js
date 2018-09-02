const fs = require('fs')
const {promisify} = require('util')
const {basename} = require('path')
const sharp = require('sharp')
const {TEXTS_PATH} = require('./constants')
const {getDifference} = require('./helpers')
const {getGrid} = require('./grid')

const dictFileNameToCharacter = {
  '00': 'A', '26': 'a', '52': '0',
  '01': 'B', '27': 'b', '53': '1',
  '02': 'C', '28': 'c', '54': '2',
  '03': 'D', '29': 'd', '55': '3',
  '04': 'E', '30': 'e', '56': '4',
  '05': 'F', '31': 'f', '57': '5',
  '06': 'G', '32': 'g', '58': '6',
  '07': 'H', '33': 'h', '59': '7',
  '08': 'I', '34': 'i', '60': '8',
  '09': 'J', '35': 'j', '61': '9',
  '10': 'K', '36': 'k', '62': '+',
  '11': 'L', '37': 'l', '63': '/',
  '12': 'M', '38': 'm',
  '13': 'N', '39': 'n',
  '14': 'O', '40': 'o',
  '15': 'P', '41': 'p',
  '16': 'Q', '42': 'q',
  '17': 'R', '43': 'r',
  '18': 'S', '44': 's',
  '19': 'T', '45': 't',
  '20': 'U', '46': 'u',
  '21': 'V', '47': 'v',
  '22': 'W', '48': 'w',
  '23': 'X', '49': 'x',
  '24': 'Y', '50': 'y',
  '25': 'Z', '51': 'z',
}

/**
 * @param {string} dirname
 * @return {Promise<({char: string, image: Buffer})[]>}
 */
function getDictionary (dirname) {
  const promises = Object.keys(dictFileNameToCharacter)
    .map(name => {
      const promise = sharp(`${dirname}/${name}.png`)
        .raw()
        .toColourspace('b-w')
        .toBuffer()

      return Promise.all([
        dictFileNameToCharacter[name],
        promise,
      ])
        .then(([char, image]) => ({char, image}))
    })

  return Promise.all(promises)
}

/**
 *
 * @param {({char: string, image: Buffer})[]} dict
 * @param {string} path
 * @return {Promise<string>}
 */
async function recogniseScreenshot (dict, path) {
  console.log(`File ${path}`)
  const grid = await getGrid(path)

  const text = grid
    .map(row => {
      return row
        .map(screenshotImage => {
          return dict
            .map(({char, image: dictImage}) => ({
              char,
              diff: getDifference(screenshotImage, dictImage),
            }))
            .sort(({diff: diffA}, {diff: diffB}) => diffA - diffB)[0].char
        })
        .join('')
    })
    .join('\n')

  return text
}

async function recogniseDir (path) {
  const fsReaddir = promisify(fs.readdir)
  const fsWriteFile = promisify(fs.writeFile)
  const fsMkdir = promisify(fs.mkdir)

  const outputDir = TEXTS_PATH
  const imageExtension = '.png'
  const textExtension = '.txt'

  await fsMkdir(outputDir)
    .catch(err => err.code === 'EEXIST' ? null : Promise.reject(err))

  const dict = await getDictionary('./dict')
  const files = (await fsReaddir(path))
    .filter(name => name.endsWith(imageExtension))

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i]
    const textFileName = `${basename(fileName, imageExtension)}${textExtension}`

    const text = await recogniseScreenshot(dict, `${path}${fileName}`)
    await fsWriteFile(`${outputDir}${textFileName}`, text)
  }
}

recogniseDir(process.argv[2])
