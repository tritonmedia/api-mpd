/**
 * /v1/search - Search API
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 */

module.exports = async function (app, mpc, debug) {
  app.post('/', async (req, res) => {
    const { query } = req.body;

    if(!query) {
      return res.error({
        message: 'Invalid request.'
      })
    }

    debug('search', query)

    try {
      // wtf is this
      const results = await mpc.database.search([
        ['any', query]
      ])

      debug('results', results)

      return res.success(results)
    } catch(err) {
      debug('err', err)
      return res.error({
        message: 'Failed to search for your query.'
      })
    }
  })
}
