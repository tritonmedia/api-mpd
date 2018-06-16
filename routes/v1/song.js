/**
 * Get Metadata on a song.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 */

const albumArt = require('../../helpers/album-art')

module.exports = (app, mpc, debug) => {
  app.get('/:trackid', async (req, res) => {
    const { trackid } = req.params
    debug('get:trackid', trackid)

    try {
      const results = await mpc.database.find([
        [
          'MUSICBRAINZ_TRACKID',
          trackid
        ]
      ])

      debug('get:results', results)
      const song = results[0]
      song.albumArtURL = await albumArt(song.albumArtist, {
        album: song.album
      })

      if(!song.albumArtURL) {
        debug('get:album-art', 'failed to find artist, default to musician')
        song.albumArtURL = await albumArt(song.albumArtist)
      }
      return res.success(song)
    } catch(err) {
      return res.error('Failed to find Track')
    }
  })
}
