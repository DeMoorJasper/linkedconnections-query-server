const fs = require('fs-extra');
const Utils = require('../utils/utils');
const logger = require('../Logger')();
const url = require('url');

const PAGE_LENGTH = 3600000; // 1 hour
const SHORT_CACHE_TIMEOUT = 300000; // 5 minutes

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

    async writeCache(uri, data) {
        const fileLocation = `${this.dir}/${this.uriToFileName(uri)}`;
        let urlObject = url.parse(uri, true);
        let cacheObject = {
            data,
            cacheExpire: Date.now() + SHORT_CACHE_TIMEOUT
        };

        if (urlObject.query) {
            let query = urlObject.query;
            if (query['departureTime']) {
                let departureTime = (new Date(query['departureTime'])).getTime();

                if (Date.now() < (departureTime + PAGE_LENGTH) && departureTime > Date.now()) {
                    cacheObject.cacheExpire = departureTime;
                } else if (Date.now() > (departureTime + PAGE_LENGTH)) {
                    cacheObject.cacheExpire = null;
                }
            }
        }
        
        if (process.send) {
            process.send({
                type: 'fs',
                function: 'writeFile',
                args: [fileLocation, JSON.stringify(cacheObject)]
            });
        } else {
            await fs.writeFile(fileLocation, JSON.stringify(cacheObject));
        }

        logger.log(`[CACHE]: Cached ${uri} @ ${fileLocation}`);
    }

    async readCache(uri) {
        const fileLocation = `${this.dir}/${this.uriToFileName(uri)}`;
        try {
            let content = (await fs.readFile(fileLocation)).toString();
            let cacheObject = JSON.parse(content);

            if (cacheObject.cacheExpire < Date.now()) {
                return null;
            }

            return cacheObject.data;
        } catch (e) {
            return null;
        }
    }

    async get(uri) {
        logger.log(`[CACHE]: Requested ${uri}`);
        let cached = await this.readCache(uri);
        if (cached) {
            logger.log(`[CACHE]: Found ${uri}`);
            return cached;
        } else {
            console.log(`[CACHE]: Cache miss, request ${uri}`);
            let startTime = Date.now();

            let result = await this.ldfetch.get(uri);

            // Don't await the write, this will slow down requests
            this.writeCache(uri, result);

            console.log(`[CACHE]: Downloaded ${uri}, took ${Date.now() - startTime}ms`);
            return result;
        }
    }
}

module.exports = CacheFetcher;