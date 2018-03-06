const LDFetch = require('ldfetch'),
    BasicCSA = require('csa').BasicCSA,
    Fetcher = require('./Fetcher');

class Planner {
    constructor(config) {
        this.config = config;
        this.http = new LDFetch();
    }

    search(q) {
        return new Promise(resolve => {
            // Create fetcher: will create streams for a specific query
            const fetcher = new Fetcher(this.config, this.http);

            // 1. Validate query
            if (!q.departureStop) throw "Location of departure not set";
            if (!q.departureTime) throw "Date of departure not set";

            q.departureTime = new Date(q.departureTime);

            // 2. Use query to configure the data fetchers
            const connectionsStream = fetcher.buildConnectionsStream(q);

            // 3. fire results using CSA.js and return the stream
            const basicCSA = new BasicCSA(q);

            // When a result is found, stop the stream
            basicCSA.once("result", function () {
                fetcher.close();
            });

            resolve({
                planner: connectionsStream.pipe(basicCSA),
                http: this.http,
                connectionsStream: connectionsStream
            });
        });
    }
}

module.exports = Planner;