const express = require('express');

// Endpoints
const RootEndPoint = require('./root');
const QueryEndPoint = require('./query');
const EntrypointsEndPoint = require('./entrypoints');

class Server {
    constructor(port) {
        this.app = express();
        this.port = port;
        this.registerEndPoints();
    }

    registerEndPoints() {
        new RootEndPoint(this.app);
        new QueryEndPoint(this.app);
        new EntrypointsEndPoint(this.app);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`[ENDPOINT]: Server started on port ${this.port}`);
        });
    }
}

module.exports = Server;