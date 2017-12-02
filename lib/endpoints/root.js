class RootEndPoint {
    constructor(app) {
        this.app = app;
        this.register();
    }

    register() {
        this.app.get('/', function (req, res) {
            res.send('This is a Linked connections query server, contribute on Github: https://github.com/DeMoorJasper/linkedconnections-query-server\n' +
                '=== Currently supported endpoints ===\n' +
                '/query?q=... - Find a route\n' +
                '/entrypoints - See the entrypoints whitelist');
        });
        console.log('[ENDPOINT]: / Registered');
    }
}

module.exports = RootEndPoint;