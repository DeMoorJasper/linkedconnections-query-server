const config = require('../config.json');

class Utils {
    static trimUri(uri) {
        return uri.replace('http://','').replace('https://','');
    }

    static endPointWhitelisted(endPoint) {
        endPoint = Utils.trimUri(endPoint);
        let configEndPoints = config.entrypoints.map(uri => Utils.trimUri(uri));
        return configEndPoints.indexOf(endPoint) > -1;
    }
}

module.exports = Utils;