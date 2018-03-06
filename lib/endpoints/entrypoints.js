const config = require('../../config.json');

class EntrypointsEndPoint {
    constructor(server) {
        this.app = server.app;
        this.register();
    }

    register() {
        this.app.get('/entrypoints', function (req, res) {
            res.json(config.entrypoints);
        });
        console.log('[ENDPOINT]: /entrypoints Registered');
    }
}

module.exports = EntrypointsEndPoint;