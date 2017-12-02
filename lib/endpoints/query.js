const Query = require('../query/query');
const Utils = require('../utils');

class QueryEndPoint {
    constructor(app) {
        this.app = app;
        this.register();
    }

    register() {
        this.app.get('/query', this.handleRequest);
        console.log('[ENDPOINT]: /query Registered');
    }

    handleRequest(req, res) {
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
        const planner = new Query(config);

        planner.search(q).then((events) => {
            events.planner.once('result', (path) => {
                console.log("[PLANNER]: Result found");
                res.json(path);
            });
            // Keep event to prevent planner from going to take a nap
            events.planner.on("data", function (connection) {
                // console.log("[PLANNER]: Connection found");
            });
        });
    }
}

module.exports = QueryEndPoint;