const Server = require('../lib/Server');
const config = require('../config.json');

async function start() {
  const server = new Server(config.port, {
    logLevel: config.logLevel || 3
  });
  await server.start();
}

start();