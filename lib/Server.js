const express = require('express');

// Endpoints
const RootEndPoint = require('./endpoints/root');
const QueryEndPoint = require('./endpoints/query');
const EntrypointsEndPoint = require('./endpoints/entrypoints');
const Farm = require('./workers/WorkerFarm');
const logger = require('./Logger');

class Server {
    constructor(port, options = {}) {
        this.port = port;
        this.app = express();
        this.logger = logger(options);

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
            this.logger.log(`[SERVER]: Listening on port ${this.port}`);
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