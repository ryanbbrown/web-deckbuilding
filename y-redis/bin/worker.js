#!/usr/bin/env node

import * as env from 'lib0/environment'
import * as yredis from '@y/redis'
import * as Y from 'yjs'

const redisPrefix = env.getConf('redis-prefix') || 'y'
const postgresUrl = env.getConf('postgres')
const s3Endpoint = env.getConf('s3-endpoint')

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

let ydocUpdateCallback = env.getConf('ydoc-update-callback')
if (ydocUpdateCallback != null && ydocUpdateCallback.slice(-1) !== '/') {
  ydocUpdateCallback += '/'
}

/**
 * @type {(room: string, ydoc: Y.Doc) => Promise<void>}
 */
const updateCallback = async (room, ydoc) => {
  if (ydocUpdateCallback != null) {
    // call YDOC_UPDATE_CALLBACK here
    const formData = new FormData()
    // @todo only convert ydoc to updatev2 once
    formData.append('ydoc', new Blob([Y.encodeStateAsUpdateV2(ydoc)]))
    // @todo should add a timeout to fetch (see fetch signal abortcontroller)
    const res = await fetch(new URL(room, ydocUpdateCallback), { body: formData, method: 'PUT' })
    if (!res.ok) {
      console.error(`Issue sending data to YDOC_UPDATE_CALLBACK. status="${res.status}" statusText="${res.statusText}"`)
    }
  }
}

const worker = await yredis.createWorker(store, redisPrefix, {
  updateCallback
})

// Gracefully shut down the worker when running in Docker/Fly.io
process.on('SIGTERM', shutDown)
process.on('SIGINT', shutDown)

async function shutDown () {
  console.log('[y-redis-worker] Received SIGTERM/SIGINT - shutting down gracefully')
  try {
    await worker.client.destroy()
    await store.destroy()
    console.log('[y-redis-worker] Cleanup complete')
    process.exit(0)
  } catch (e) {
    console.error('[y-redis-worker] Error during shutdown:', e)
    process.exit(1)
  }
}
