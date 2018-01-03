const fs = require('fs');
const Utils = require('../utils');

class CacheFetcher {
    constructor(ldfetch) {
        this.dir = './cache';
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
            fs.writeFile(fileLocation, JSON.stringify(object, null, "\t"), (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    get(uri) {
        let fileLocation = `${this.dir}/${this.uriToFileName(uri)}`;
        console.log(`[CACHE]: Requested ${uri} @ ${fileLocation}`);
        return new Promise((resolve, reject) => {
            fs.readFile(fileLocation, (err, data) => {
                if (err) {
                    this.ldfetch.get(uri)
                        .then(result => {
                            // Only cache specific timeframe dumps, don't cache the latest root connections
                            if (uri.indexOf("departureTime") !== -1) {
                                this.writeFile(fileLocation, result)
                                    .then(() => console.log(`[CACHE]: Cached ${uri} @ ${fileLocation}`))
                                    .catch(e => console.log(e));
                            }
                            console.log(`[CACHE]: Downloaded ${uri}`);
                            resolve(result);
                        })
                        .catch(e => reject(e));
                } else {
                    console.log(`[CACHE]: Found ${uri} @ ${fileLocation}`);
                    resolve(JSON.parse(data));
                }
            });
        });
    }
}

module.exports = CacheFetcher;