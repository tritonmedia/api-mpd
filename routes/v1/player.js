/**
 * /v1/player - Player API
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 * @admin
 */

const albumArt = require('album-art')

module.exports = async function (app, mpc, debug) {
  const getPlaylistPos = async () => {
    const nowPlaying = await mpc.status.currentSong()
    if(!nowPlaying) throw new Error('Expected song to be playing.')

    return Number(nowPlaying.position)
  }

  app.get('/url', (req, res) => res.success('https://music.tritonjs.com/stream'))

  /**
   * Add song to the queue.
   *
   * @note Appends it so it plays next.
   */
  app.post('/queue', async (req, res) => {
    const { file } = req.body;

    if(!file) {
      return res.error({
        message: 'File not specified.'
      })
    }


    debug('attempting to queue', file)

    try {
      const currentPosition = await getPlaylistPos()
      debug('currently at', currentPosition)

      // wtf is this
      const results = await mpc.database.find([
        ['file', file]
      ])
      if(!results[0]) throw new Error('File not found.')

      const addedSong = await mpc.currentPlaylist.addId(file)
      const move = await mpc.currentPlaylist.moveId(addedSong, currentPosition + 1)

      debug('move', move)
    } catch(err) {
      debug('err', err)
      return res.error({
        message: err.message
      })
    }

    return res.success()
  })

  /**
   * Get the queue.
   *
   * @param {Number} limit - limit of songs to show up in the queue (after now.)
   * @param {String}
   */
  app.get('/queue', async (req, res) => {
    const limit = req.query.limit || 5

    debug('limit', limit)

    try {
      const currentPosition = await getPlaylistPos()
      const calcLim = Math.floor(currentPosition + Number(limit))

      debug('queue limit', currentPosition, calcLim)
      const songs = await mpc.currentPlaylist.playlistRangeInfo(currentPosition, calcLim)

      return res.success(songs)
    } catch(err) {
      debug('err', err)
      return res.error({
        message: err.message
      })
    }
  })

  /**
   * Get now playing
   */
  app.get('/status', async (req, res) => {
    try {
      const song = await mpc.status.currentSong()
      if(!song) throw new Error('Song not playing.')

      song.albumArtURL = await albumArt(song.albumArtist, {
        album: song.album
      })

      if(!song.albumArtURL) {
        debug('get:album-art', 'failed to find artist, default to musician')
        song.albumArtURL = await albumArt(song.albumArtist)
      }

      return res.success(song)
    } catch(err) {
      return res.success([])
    }
  })

  /**
   * Set the status:
   *
   *  status: "pause"|"next"|"previous"|"play"
   */
  app.post('/status', async (req, res) => {
    const { status } = req.body;

    const ALLOWED_STATUSES = ['pause', 'next', 'previous', 'play']
    try {
      if(!status) throw new TypeError('Missing status.')
      if(ALLOWED_STATUSES.indexOf(status) === -1) throw new Error('Unexpected status.')
      if(!mpc.playback[status]) throw new Error('Unexpected status.')
      await mpc.playback[status](status !== 'play')
    } catch(err) {
      return res.error({
        message: err.message
      })
    }

    return res.success(true)
  })
}
