const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const {areSimilar} = require('./helpers')
const {getGrid} = require('./grid')
const {CHARACTER_SIZE, DICTIONARY_SIZE, DICTIONARY_PATH} = require('./constants')

/**
 * Computes an image merged from a list of provided images
 * @param {Buffer[]} images
 * @return {Buffer}
 */
function getMedianCharacter (images) {
  const imagesAmount = images.length
  const result = images[0].slice()

  for (let pixel = 0; pixel < images[0].length; pixel++) {
    let pixelValue = 0
    const values = []
    for (let image = 0; image < imagesAmount; image++) {
      values.push(images[image][pixel])
    }
    result[pixel] = Math.round(pixelValue / imagesAmount)
    result[pixel] = values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
  }

  return result
}

/**
 * @param {{merged: Buffer, members: Buffer[]}} itemA
 * @param {{merged: Buffer, members: Buffer[]}} itemB
 * @return {{merged: Buffer, members: Buffer[]}}
 */
function mergeTwoGroups (itemA, itemB) {
  const members = itemA.members.concat(itemB.members)
  return {
    merged: getMedianCharacter(members),
    members,
  }
}

/**
 *
 * @param {{merged: Buffer, members: Buffer[]}[]} dict
 * @param {number} threshold
 * @return {{merged: Buffer, members: Buffer[]}[]}
 */
function mergeGroupsWithThreshold (dict, threshold) {
  const dictLength = dict.length
  const skip = {}
  let newDict = []

  for (let i = 0; i < dictLength; i++) {
    if (skip[i]) { continue }
    let mergedGroup = dict[i]

    for (let j = i + 1; j < dictLength; j++) {
      if (skip[j]) { continue }
      const groupB = dict[j]

      if (areSimilar(mergedGroup.merged, groupB.merged, threshold)) {
        mergedGroup = mergeTwoGroups(mergedGroup, groupB)
        skip[j] = true
      }
    }

    newDict.push(mergedGroup)
  }

  return newDict
}

/**
 * @param {{merged: Buffer, members: Buffer[]}[]} groups
 * @return {{merged: Buffer, members: Buffer[]}[]}
 */
function reduceGroupsToDictSize (groups) {
  let threshold = 0

  while (groups.length > DICTIONARY_SIZE) {
    const mergedGroups = mergeGroupsWithThreshold(groups, threshold)
    console.log({
      before: groups.length,
      after: mergedGroups.length,
      threshold,
    })

    if (mergedGroups.length === groups.length) {
      // images were mapped to 3 colors: 0, 127, 255
      // so they differ by 128
      threshold += 128
    }

    groups = mergedGroups
  }

  return groups
}

/**
 *
 * @param {Buffer[][]} grid
 * @return {{merged: Buffer, members: Buffer[]}[]}
 */
function makeGroupsFromGrid (grid) {
  return grid
    .reduce((arr, row) => arr.concat(row), [])
    .map(buffer => ({
      merged: buffer,
      members: [buffer],
    }))
}

/**
 * @param {{merged: Buffer, members: Buffer[]}[]} groups
 * @return {Buffer[]}
 */
function makeDictFromGroups (groups) {
  return groups.map(({merged}) => merged)
}

/**
 * @param {Buffer} buffer
 * @param {string} filename
 * @return {Promise<object>}
 */
function saveBufferAsPng (buffer, filename) {
  const dirname = path.dirname(filename)

  return promisify(fs.mkdir)(dirname)
    .catch(err => err.code === 'EEXIST' ? null : Promise.reject(err))
    .then(() => sharp(buffer, {
        raw: {
          channels: 1,
          ...CHARACTER_SIZE,
        },
      })
        .png()
        .toFile(filename),
    )
}

/**
 * Take several screenshots,
 * slice them on separate characters,
 * split characters on 64 groups,
 * calculate merged image for every group,
 * write merged image into it's own file.
 *
 * @param {string[]} paths
 * @return {Promise<object[]>}
 */
function buildDictionaryFiles (paths) {
  return Promise.all(paths.map(path => getGrid(path)))
    .then(grids => {
      const groups = grids.map(grid => reduceGroupsToDictSize(makeGroupsFromGrid(grid)))
        .reduce((arr, groups) => arr.concat(groups), [])
      return makeDictFromGroups(reduceGroupsToDictSize(groups))
    })
    .then(dict => Promise.all(dict.map((buffer, index) => {
      const path = (`${DICTIONARY_PATH}_${String(index).padStart(3, '0')}.png`)
      return saveBufferAsPng(buffer, path)
    })))

}

buildDictionaryFiles(process.argv.slice(2))
