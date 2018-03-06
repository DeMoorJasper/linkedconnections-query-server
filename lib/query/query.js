const LDFetch = require('ldfetch'),
    Planner = require('csa').BasicCSA,
    Fetcher = require('./fetcher');

class Query {
    constructor(config) {
        this._config = config;
        this._http = new LDFetch();
    }

    search(q) {
        return new Promise(resolve => {
            // Create fetcher: will create streams for a specific query
            var fetcher = new Fetcher(this._config, this._http);

            //1. Validate query
            if (!q.departureStop) throw "Location of departure not set";
            if (!q.departureTime) throw "Date of departure not set";
            q.departureTime = new Date(q.departureTime);

            //2. Use query to configure the data fetchers
            fetcher.buildConnectionsStream(q, connectionsStream => {
                //3. fire results using CSA.js and return the stream
                var planner = new Planner(q);
                //When a result is found, stop the stream
                planner.on("result", function () {
                    fetcher.close();
                });
                resolve({
                    planner: connectionsStream.pipe(planner),
                    http: this._http,
                    connectionsStream: connectionsStream
                });
            });
        });
    }
}

module.exports = Query;