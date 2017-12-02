const Server = require('../lib/endpoints/Server');
const config = require('../config.json');

let server = new Server(config.port);

server.start();