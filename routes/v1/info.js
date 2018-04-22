/**
 * /v1/info - Server Info API
 * 
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 * @admin
 */

const request = require('request-promise')

module.exports = (app, mpc, debug) => {
  /**
   * GET /icecast - Get icecast info
   */
  app.get('/icecast', async (req, res) => {
    const info = await request.get('http://icecast:8000/status-json.xsl')

    debug('icecast', info)

    return res.success(info.icestats.source)
  })
}
