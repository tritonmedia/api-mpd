/**
 * MPD Web API
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 */

const express = require('express')
const bodyp = require('body-parser')
const dm = require('debug')
const fs = require('fs-extra')
const path = require('path')
const { MPC } = require('mpc-js')

const debug = dm('api:main')

const API_VERSION = process.env.API_VERSION || 'v1'
const ROUTES_DIR = path.join(__dirname, `routes/${API_VERSION}`)
const MPC_HOST = process.env.MPC_HOST || '127.0.0.1'
const MPC_PORT = process.env.MPC_PORT || 6600

const app = express()
app.use(bodyp.json())
app.use((req, res, next) => {
  res.error = data => res.send({
    success: false,
    ...data
  })

  res.success = data => res.send({
    success: true,
    data
  })

  next();
});

const mpc = new MPC()
mpc.connectTCP(MPC_HOST, MPC_PORT)

// FIXME: We need to timeout.
mpc.on('ready', async () => {
  debug('mpc->ready')
  debug('starting init')

  if(!await fs.exists(ROUTES_DIR)) {
    throw new Error(`'${ROUTES_DIR}' not found.`)
  }

  const routes = await fs.readdir(ROUTES_DIR)
  routes.forEach(route => {
    const routeFile = path.join(ROUTES_DIR, route)

    /* eslint global-require: 0, import/no-dynamic-require: 0 */
    const fn = require(routeFile)
    const { name } = path.parse(route)
    const logger = dm(`api:endpoint:${API_VERSION}:${name}`)
    const newRouter = express.Router()

    try {
      fn(newRouter, mpc, logger)
    } catch(err) {
      debug('err', err)
    }

    const mountPath = `/${API_VERSION}/${name}`
    debug(`${route} -> ${mountPath}`)

    app.use(mountPath, newRouter)
  });

  app.listen(8100, () => {
    debug('listening on port 8100')
  })
})
