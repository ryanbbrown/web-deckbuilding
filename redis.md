
# Local Redis CLI Commands (via fly redis connect)

## Connect to Redis
First, establish a tunnel to your Redis database:
```bash
fly redis connect
```
This will open an interactive redis-cli session. Run the following commands inside redis-cli:

## View database info
```redis
INFO                    # Get all info (server, memory, stats, replication, etc)
INFO memory             # Memory usage details
INFO stats              # Stats (connections, commands processed, etc)
INFO keyspace           # Number of keys per database
INFO server             # Server details
INFO clients            # Connected clients info
```

## View and manage keys
```redis
KEYS *                  # List all keys (use cautiously in production)
DBSIZE                  # Get total number of keys
SCAN 0                  # Iterate through keys (safer than KEYS *)
```

## Add/Set keys
```redis
SET mykey "myvalue"                    # Set a simple string key
SET user:1 "John Doe"                  # Set with namespacing pattern
SETEX tempkey 3600 "expires in 1hr"    # Set with expiration (seconds)
HSET user:100 name "Jane" age 30       # Set hash fields
LPUSH mylist "item1"                   # Add to list
SADD myset "member1"                   # Add to set
```

## Get/Read keys
```redis
GET mykey                              # Get string value
HGETALL user:100                       # Get all hash fields
LRANGE mylist 0 -1                     # Get all list items
SMEMBERS myset                         # Get all set members
TTL mykey                              # Get time-to-live in seconds
TYPE mykey                             # Get key type
```

## Remove/Delete keys
```redis
DEL mykey                              # Delete a single key
DEL key1 key2 key3                     # Delete multiple keys
FLUSHDB                                # Delete ALL keys in current database (CAREFUL!)
FLUSHALL                               # Delete ALL keys in ALL databases (VERY CAREFUL!)
```

## Memory and performance analysis
```redis
MEMORY USAGE mykey                     # Get memory used by a key
MEMORY STATS                           # Memory allocation stats
SLOWLOG GET 10                         # Get 10 slowest queries
CLIENT LIST                            # List all connected clients
```

## Exit redis-cli
```redis
QUIT                                   # or CTRL+D
```

---

# Direct Redis API commands (work without YRedis app)

**NOTE**: These HTTP endpoints only work from within Fly.io's private network,
not from your local machine. Use the redis-cli commands above for local access.

## FROM UPSTASH CONSOLE
UPSTASH_REDIS_REST_URL="http://fly-web-deckbuilding-redis.upstash.io:6379"
UPSTASH_REDIS_REST_TOKEN="AZhLACQgNWUyZGZhZGYtYzc1NC00M2M2LThhZWUtYzk1ZjQyMmVjOWFmZTkwZWUyMGVlZTBiNDcyZmEwODQ4MGZlMTA3MmQ0NmY="

TCP endpoint: redis://default:e90ee20eee0b472fa08480fe1072d46f@fly-web-deckbuilding-redis.upstash.io:6379
HTTP endpoint: http://fly-web-deckbuilding-redis.upstash.io:6379
Password: e90ee20eee0b472fa08480fe1072d46f
Token: AZhLACQgNWUyZGZhZGYtYzc1NC00M2M2LThhZWUtYzk1ZjQyMmVjOWFmZTkwZWUyMGVlZTBiNDcyZmEwODQ4MGZlMTA3MmQ0NmY=
Port: 6379
TLS/SSL: Disabled

example curl request:
curl http://fly-web-deckbuilding-redis.upstash.io:6379/set/my-key \
  -H "Authorization: Bearer AZhLACQgNWUyZGZhZGYtYzc1NC00M2M2LThhZWUtYzk1ZjQyMmVjOWFmZTkwZWUyMGVlZTBiNDcyZmEwODQ4MGZlMTA3MmQ0NmY=" \
  -d '"my-value"'

---

# These scripts/commands only work when web-deckbulding-yredis is running
## 1. Get info (initial check):
```
fly ssh console -a web-deckbuilding-yredis --machine e822e95f274638 -C "node -e \"
    import('redis').then(async redis => {
    const client = redis.createClient({ url: process.env.REDIS });
    await client.connect();
    const info = await client.info('all');
    console.log(info);
    await client.quit();
    });
    \""
```

## 2. Flush database:
```
fly ssh console -a web-deckbuilding-yredis --machine e822e95f274638 -C "node -e \"
    import('redis').then(async redis => {
    const client = redis.createClient({ url: process.env.REDIS });
    await client.connect();
    const result = await client.flushDb();
    console.log('FLUSHDB result:', result);
    const info = await client.info('keyspace');
    console.log('Keyspace after flush:', info);
    await client.quit();
    });
    \""
```

## 3. Add a key:
```
fly ssh console -a web-deckbuilding-yredis --machine e822e95f274638 -C "node -e \"
    import('redis').then(async redis => {
    const client = redis.createClient({ url: process.env.REDIS });
    await client.connect();
    const result = await client.set('my-key-2', 'my-value');
    console.log('SET result:', result);
    const value = await client.get('my-key-2');
    console.log('GET my-key-2:', value);
    const info = await client.info('keyspace');
    console.log('Keyspace:', info);
    await client.quit();
    });
    \""
```

## scale down worker
`fly scale count worker=0 -a web-deckbuilding-yredis-worker --yes`

## scale back up worker
`fly scale count worker=2 -a web-deckbuilding-yredis-worker --yes`



## scale down server
`fly scale count web=0 -a web-deckbuilding-yredis --yes`

## scale back up sver
`fly scale count web=1 -a web-deckbuilding-yredis --yes`
