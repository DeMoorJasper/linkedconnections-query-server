const fs = require('fs-extra');
const Utils = require('../utils/utils');
const logger = require('../Logger')();
const url = require('url');

class CacheFetcher {
    constructor(ldfetch, options = {}) {
        this.dir = './.cache';
        this.ldfetch = ldfetch;

        fs.mkdirp(this.dir);

        this.options = {
            pageLength: options.pageLength || 3600000,
            timeout: options.timeout || 60000
        }
    }

    uriToFileName(uri) {
        uri = Utils.trimUri(uri);

        return `${Utils.md5Hash(uri)}.json`;
    }

    async writeCache(uri, data) {
        const fileLocation = `${this.dir}/${this.uriToFileName(uri)}`;
        let urlObject = url.parse(uri, true);
        let cacheObject = {
            data,
            cacheExpire: Date.now() + this.options.timeout
        };

        if (urlObject.query) {
            let query = urlObject.query;
            if (query['departureTime']) {
                let departureTime = (new Date(query['departureTime'])).getTime();

                if (Date.now() < (departureTime + this.options.pageLength) && departureTime > Date.now()) {
                    cacheObject.cacheExpire = departureTime;
                } else if (Date.now() > (departureTime + this.options.pageLength)) {
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

            if (cacheObject.cacheExpire && cacheObject.cacheExpire < Date.now()) {
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
            logger.log(`[CACHE]: Cache miss, request ${uri}`);
            let startTime = Date.now();

            let result = await this.ldfetch.get(uri);

            // Don't await the write, this will slow down requests
            this.writeCache(uri, result);

            logger.log(`[CACHE]: Downloaded ${uri}, took ${Date.now() - startTime}ms`);
            return result;
        }
    }
}

module.exports = CacheFetcher;