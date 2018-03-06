const Utils = require('../utils');
const Farm = require('../workers/WorkerFarm');

class QueryEndPoint {
    constructor(app) {
        this.app = app;
        this.register();
        this.farm = new Farm();
    }

    register() {
        this.app.get('/query', this.handleRequest.bind(this));
        console.log('[ENDPOINT]: /query Registered');
    }

    async handleRequest(req, res) {
        let q = req.query.q;
        try {
            q = JSON.parse(q);
        } catch (e) {
            return res.json({
                error: 'Please provide valid JSON'
            });
        }

        if (!q.entrypoints) return res.json({
            error: 'Please provide entrypoints'
        });

        let validEntryPoints = true;
        q.entrypoints.forEach(entrypoint => {
            validEntryPoints = !Utils.endPointWhitelisted(entrypoint) ? false : validEntryPoints;
        });

        if (!validEntryPoints) return res.json({
            error: 'One or more of these entrypoints are not whitelisted!'
        });

        if (!q.departureTime) return res.json({
            error: 'Please provide a departure time'
        });

        if (!q.departureStop) return res.json({
            error: 'Please provide a departure stop'
        });

        if (!q.arrivalStop) return res.json({
            error: 'Please provide a arrival stop'
        });

        // if (!q.minimumTransferTime) q.minimumTransferTime = 6;

        // Prevent infinite searching (Denial Of Service)
        if (!q.latestDepartTime) q.latestDepartTime = new Date(new Date(q.departureTime) + 60 * 60 * 1000);
        q.searchTimeOut = 60000;

        let config = {
            entrypoints: q.entrypoints
        };
        
        try {
            res.json(await this.farm.search(config, q));
        } catch(e) {
            console.log(e);
        }
    }
}

module.exports = QueryEndPoint;