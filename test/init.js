const http = require('http');
const Server = require('../lib/Server');

let server;
async function initServer() {
  await getServer();
}

before(async function() {
  await initServer();
});

after(async function() {
  await server.stop();
});

async function sendRequest(url) {
  return new Promise(resolve => {
    http.get(url, (result) => {
      resolve(result);
    });
  });
}

async function getServer() {
  if (!server) {
    server = new Server(4400, {
      logLevel: 0
    });
    await server.start();
  }
  return server;
}

async function getServerLocation() {
  const serverInstance = await getServer();
  return `http://localhost:${server.port}`;
}

async function getResultData(result) {
  return new Promise(resolve => {
    result.setEncoding('utf8');
    let data = '';
    result.on('data', c => (data += c));
    result.on('end', () => {
      resolve(data);
    });
  });
}

exports.sendRequest = sendRequest;
exports.getServer = getServer;
exports.getServerLocation = getServerLocation;
exports.getResultData = getResultData;