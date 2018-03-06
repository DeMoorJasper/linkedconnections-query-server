const ConnectionsStream = require('./ConnectionsFetcher'), 
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
        let connectionsStream = null;

        this.entrypoints.forEach((entrypoint, i) => {
            const newConnectionsStream = new ConnectionsStream(entrypoint, this.http, query.departureTime);
            if (i === 0) {
                connectionsStream = newConnectionsStream;
                this.connectionsStreams = [newConnectionsStream];
            } else {
                this.connectionsStreams.push(newConnectionsStream);
                connectionsStream = new MergeSortStream(connectionsStream, newConnectionsStream, function (connectionA, connectionB) {
                    return connectionB.departureTime - connectionA.departureTime;
                });
            }
        });

        return connectionsStream;
    };
}

module.exports = Fetcher;