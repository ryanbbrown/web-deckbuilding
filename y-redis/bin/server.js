#!/usr/bin/env node

import * as number from 'lib0/number'
import * as env from 'lib0/environment'
import * as yredis from '@y/redis'

const port = number.parseInt(env.getConf('port') || '3002')
const redisPrefix = env.getConf('redis-prefix') || 'y'
const postgresUrl = env.getConf('postgres')
const s3Endpoint = env.getConf('s3-endpoint')
const checkPermCallbackUrl = env.ensureConf('AUTH_PERM_CALLBACK')

/**
 * @type {import('../src/storage.js').AbstractStorage}
 */
let store
if (s3Endpoint) {
  console.log('using s3 store')
  const { createS3Storage } = await import('../src/storage/s3.js')
  const bucketName = 'ydocs'
  const s3Store = createS3Storage(bucketName)
  store = s3Store
  try {
    // make sure the bucket exists
    await s3Store.client.makeBucket(bucketName)
  } catch (e) {}
} else if (postgresUrl) {
  console.log('using postgres store')
  const { createPostgresStorage } = await import('../src/storage/postgres.js')
  store = await createPostgresStorage()
} else {
  console.log('ATTENTION! using in-memory store')
  const { createMemoryStorage } = await import('../src/storage/memory.js')
  store = createMemoryStorage()
}

const server = await yredis.createYWebsocketServer({ port, store, checkPermCallbackUrl, redisPrefix })

// Gracefully shut down the server when running in Docker/Fly.io
process.on('SIGTERM', shutDown)
process.on('SIGINT', shutDown)

async function shutDown () {
  console.log('[y-redis] Received SIGTERM/SIGINT - shutting down gracefully')
  try {
    await server.destroy()
    await store.destroy()
    console.log('[y-redis] Cleanup complete')
    process.exit(0)
  } catch (e) {
    console.error('[y-redis] Error during shutdown:', e)
    process.exit(1)
  }
}
