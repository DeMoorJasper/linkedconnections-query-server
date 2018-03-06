const express = require('express');

// Endpoints
const RootEndPoint = require('./root');
const QueryEndPoint = require('./query');
const EntrypointsEndPoint = require('./entrypoints');
const Farm = require('../workers/WorkerFarm');

class Server {
    constructor(port) {
        this.app = express();
        this.port = port;
        this.registerEndPoints();
    }

    registerEndPoints() {
        new RootEndPoint(this);
        new QueryEndPoint(this);
        new EntrypointsEndPoint(this);
    }

    async start() {
        this.farm = new Farm();
        return new Promise(resolve => {
            this.server = this.app.listen(this.port, resolve);
        });
    }

    async stop() {
        if (this.farm) {
            await this.farm.stop();
        }

        if (this.server) {
            return new Promise(resolve => {
                this.server.close(resolve);
                this.server = null;
            });
        }
    }
}

module.exports = Server;