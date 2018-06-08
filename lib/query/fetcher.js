const ConnectionsFetcher = require('./ConnectionsFetcher'), 
        MergeSortStream = require('merge-sort-stream');

class Fetcher {
    constructor(config, http) {
        this.http = http;
        this.entrypoints = config.entrypoints || [];
        this.connectionsStreams = []; // Holds array of streams
    }

    close() {
        // Close all connection streams that are attached to this query
        for (let connectionStream of this.connectionsStreams) {
            connectionStream.close();
        }
    };

    buildConnectionsStream(query) {
        // Get the connections from the Web
        let connectionsFetcher = null;

        this.entrypoints.forEach((entrypoint, i) => {
            const newConnectionsFetcher = new ConnectionsFetcher(entrypoint, this.http, query.departureTime);
            if (i === 0) {
                connectionsFetcher = newConnectionsFetcher;
                this.connectionsStreams = [newConnectionsFetcher];
            } else {
                this.connectionsStreams.push(newConnectionsFetcher);
                connectionsFetcher = new MergeSortStream(connectionsFetcher, newConnectionsFetcher, function (connectionA, connectionB) {
                    return connectionB.departureTime - connectionA.departureTime;
                });
            }
        });

        return connectionsFetcher;
    };
}

module.exports = Fetcher;