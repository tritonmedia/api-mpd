/**
 * Helper function around album-art that caches the art.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @version 1
 * @license MIT
 */

const albumArt = require('album-art')

const cache = {}

module.exports = async function (artist, opts) {
  if(!cache[artist]) {
    cache[artist] = {
      albums: {},
      self: null
    }
  }

  if(cache[artist].self && !opts) return cache[artist].self
  if(cache[artist].albums[opts.album]) return cache[artist].albums[opts.album]

  const art = await albumArt(artist, opts)
  if(!art) return null

  if(!opts) {
    cache[artist].self = art
    return art
  }

  cache[artist].albums[opts.album] = art

  return art
}
