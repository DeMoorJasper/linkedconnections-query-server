const fs = require('fs-extra');
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

    async writeFile(fileLocation, object) {
        const content = JSON.stringify(object, null, "\t");
        if (process.send) {
            process.send({
                type: 'fs',
                function: 'writeFile',
                args: [fileLocation, content]
            });
        } else {
            await fs.writeFile(fileLocation, content);
        }
    }

    async get(uri) {
        let fileLocation = `${this.dir}/${this.uriToFileName(uri)}`;
        logger.log(`[CACHE]: Requested ${uri} @ ${fileLocation}`);
        let cached;
        try {
            cached = await fs.readFile(fileLocation);
        } catch (e) {
            // Do nothing...
        }

        if (cached) {
            logger.log(`[CACHE]: Found ${uri} @ ${fileLocation}`);
            return JSON.parse(cached.toString());
        } else {
            console.log('Start request: ', uri);
            let startTime = Date.now();
            let result = await this.ldfetch.get(uri);
            // Only cache specific timeframe dumps, don't cache the latest root connections
            if (uri.indexOf("departureTime") !== -1) {
                await this.writeFile(fileLocation, result);
                logger.log(`[CACHE]: Cached ${uri} @ ${fileLocation}`);
            }
            logger.log(`[CACHE]: Downloaded ${uri}`);
            console.log('Request took: ', (Date.now() - startTime), 'ms');
            return result;
        }
    }
}

module.exports = CacheFetcher;