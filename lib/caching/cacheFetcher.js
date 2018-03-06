const fs = require('fs');
const Utils = require('../utils/utils');
const logger = require('../Logger')();

class CacheFetcher {
    constructor(ldfetch) {
        this.dir = './.cache';
        this.ldfetch = ldfetch;
        this.checkDirectory(this.dir);
    }

    uriToFileName(uri) {
        uri = Utils.trimUri(uri);

        return `${Utils.md5Hash(uri)}.json`;
    }

    checkDirectory(dir) {
        let tree = dir.split(/[/]/);
        let loc = "";
        tree.forEach(subDirectory => {
            loc += subDirectory + "/";
            if (!fs.existsSync(loc)) {
                fs.mkdirSync(loc);
            }
        });
    }

    writeFile(fileLocation, object) {
        return new Promise((resolve, reject) => {
            const content = JSON.stringify(object, null, "\t");
            if (process.send) {
                process.send({
                    type: 'fs',
                    function: 'writeFile',
                    args: [fileLocation, content]
                });
                resolve();
            } else {
                fs.writeFile(fileLocation, content, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            }
        });
    }

    get(uri) {
        let fileLocation = `${this.dir}/${this.uriToFileName(uri)}`;
        logger.log(`[CACHE]: Requested ${uri} @ ${fileLocation}`);
        return new Promise((resolve, reject) => {
            fs.readFile(fileLocation, (err, data) => {
                if (err) {
                    this.ldfetch.get(uri)
                        .then(result => {
                            // Only cache specific timeframe dumps, don't cache the latest root connections
                            if (uri.indexOf("departureTime") !== -1) {
                                this.writeFile(fileLocation, result)
                                    .then(() => logger.log(`[CACHE]: Cached ${uri} @ ${fileLocation}`))
                                    .catch(e => logger.error(e));
                            }
                            logger.log(`[CACHE]: Downloaded ${uri}`);
                            resolve(result);
                        })
                        .catch(e => reject(e));
                } else {
                    try {
                        logger.log(`[CACHE]: Found ${uri} @ ${fileLocation}`);
                        const parsed = JSON.parse(data.toString());
                        resolve(parsed);
                    } catch(e) {
                        // Error handling for failed JSON parsing
                        reject(e);
                    }
                }
            });
        });
    }
}

module.exports = CacheFetcher;