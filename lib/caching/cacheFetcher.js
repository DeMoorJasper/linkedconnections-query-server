const fs = require('fs');

class CacheFetcher {
    constructor(ldfetch) {
        this.dir = './cache';
        this.ldfetch = ldfetch;
        this.checkDirectory(this.dir);
    }

    uriToFileName(uri) {
        return uri.replace('http://','').replace('https://','').replace(/([^a-z0-9]+)/gi, '-') + '.json';
    }

    checkDirectory(dir) {
        let tree = dir.split(/[/]/);
        let loc = "";
        tree.forEach(subDirectory => {
            loc += subDirectory + "/";
            if (!fs.existsSync(loc)){
                fs.mkdirSync(loc);
            }
        });
    }

    writeFile(uri, object) {
        return new Promise((resolve, reject) => {
            fs.writeFile(`${this.dir}/${this.uriToFileName(uri)}`, JSON.stringify(object, null, "\t"), (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    get(uri) {
        console.log(`[CACHE]: Requested ${uri}`);
        return new Promise((resolve, reject) => {
            fs.readFile(`${this.dir}/${this.uriToFileName(uri)}`, (err, data) => {
                if (err) {
                    this.ldfetch.get(uri)
                    .then(result => {
                        // Only cache specific timeframe dumps, don't cache the latest root connections
                        if (uri.indexOf("departureTime") !== -1) {
                            this.writeFile(uri, result)
                            .then(() => console.log(`[CACHE]: Cached ${uri}`))
                            .catch(e => console.log(e));
                        }
                        console.log(`[CACHE]: Downloaded ${uri}`);
                        resolve(result);
                    })
                    .catch(e => reject(e));
                } else {
                    console.log(`[CACHE]: Found ${uri}`);
                    resolve(JSON.parse(data));
                }
            });
        });
    }
}

module.exports = CacheFetcher;