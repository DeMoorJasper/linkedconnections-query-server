var ConnectionsStream = require('./connectionsFetcher'),
    MergeSortStream = require('merge-sort-stream'),
    util = require('util'),
    async = require('async'),
    EventEmitter = require('events');

class Fetcher {
    constructor(config, http) {
        EventEmitter.call(this);
        this._config = config;
        this._http = http;
        this._entrypoints = config.entrypoints || [];
        this._connectionsStreams = []; // Holds array of streams
        this._mergeStream = null;
    }

    close() {
        //close all connection streams that are attached to this query
        for (var i in this._connectionsStreams) {
            this._connectionsStreams[i].close();
        }
    };

    buildConnectionsStream(query, cb) {
        //Get the connections from the Web
        var self = this;
        var connectionsStream = null;
        async.forEachOf(this._entrypoints, function (entryUrl, i, done) {
            var newConnectionsStream = new ConnectionsStream(entryUrl, self._http, query.departureTime);
            if (i === 0) {
                connectionsStream = newConnectionsStream;
                self._connectionsStreams = [newConnectionsStream];
            } else {
                self._connectionsStreams.push(newConnectionsStream);
                connectionsStream = new MergeSortStream(connectionsStream, newConnectionsStream, function (connectionA, connectionB) {
                    return connectionB.departureTime - connectionA.departureTime;
                });
            }
            done();
        }, function (error) {
            cb(connectionsStream);
        });
    };
}

util.inherits(Fetcher, EventEmitter);

module.exports = Fetcher;