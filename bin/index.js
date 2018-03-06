const Server = require('../lib/endpoints/Server');
const config = require('../config.json');

async function start() {
  const server = new Server(config.port);
  await server.start();
  console.log(`[ENDPOINT]: Server started on port ${server.port}`);
}

start();