/**
 * Helper function around album-art that caches the art.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @version 1
 * @license MIT
 */

const albumArt = require('album-art')
const debug = require('debug')('api:helpers:album-art')

const cache = {}

module.exports = async function (artist, opts) {
  if(!cache[artist]) {
    debug('cache:init', artist)
    cache[artist] = {
      albums: {},
      self: null
    }
  }

  if(cache[artist].self && !opts) return cache[artist].self
  if(cache[artist].albums[opts.album]) return cache[artist].albums[opts.album]

  debug('cache:miss', artist, 'album:', typeof opts === 'object' ? opts.album : null)
  const art = await albumArt(artist, opts)
  if(!art) return null

  if(!opts) {
    cache[artist].self = art
    return art
  }

  cache[artist].albums[opts.album] = art

  return art
}
