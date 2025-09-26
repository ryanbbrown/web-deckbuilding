The main y-redis server (which exposes both the websocket server and the auth server using `npm run both` from the package.json file) has been deployed using the following command:

`fly deploy -c fly.server.toml -a web-deckbuilding-yredis`

The worker, which just persists things to the s3-compatible tigris storage (and isn't as important), is deployed using the following command: 

`fly deploy -c fly.worker.toml -a web-deckbuilding-yredis-worker`

If you're getting unexpected issues with things, the first step should be to check to make sure that the app is running properly in its most basic form using `node y-redis/tests/test_player1.js`.

If needed, you can check the logs using `fly logs -a web-deckbuilding-yredis --no-tail | tail -n 20` to see if there are any errors.

Sometimes, just re-running the fly deploy command for the server will fix it. If that doesn't fix it, then stop and ask the user for input.