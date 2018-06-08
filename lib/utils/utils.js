const crypto = require('crypto');
const config = require('../../config.json');

function trimUri(uri) {
    return uri.replace('http://', '').replace('https://', '');
}

function endPointWhitelisted(endPoint) {
    endPoint = trimUri(endPoint);
    let configEndPoints = config.entrypoints.map(uri => trimUri(uri));
    return configEndPoints.indexOf(endPoint) > -1;
}

function md5Hash(string) {
    return crypto
        .createHash('md5')
        .update(string)
        .digest('hex');
}

exports.trimUri = trimUri;
exports.endPointWhitelisted = endPointWhitelisted;
exports.md5Hash = md5Hash;