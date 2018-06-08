const Readable = require('stream').Readable;
const UriTemplate = require('uritemplate');
const N3Util = require('n3').Util;
const ConnectionsStore = require('./ConnectionsStore');
const CacheFetcher = require('../caching/cacheFetcher');

class ConnectionsFetcher extends Readable {
    constructor(starturl, ldfetch, departureTime) {
        super({ objectMode: true });
        this.discoveryPhase = true;
        this.cache = new CacheFetcher(ldfetch);
        this.departureTime = departureTime;
        this.starturl = starturl;
        this.store;
    }

    close() {
        this.push(null);
    }

    _read() {
        if (this.discoveryPhase) {
            // Building block 1: a way to find a first page
            this.cache.get(this.starturl).then(response => {
                // filter once all triples with these predicates
                const metaTriples = response.triples.filter(triple => 
                    triple.predicate === 'http://www.w3.org/ns/hydra/core#search' ||
                    triple.predicate === 'http://www.w3.org/ns/hydra/core#mapping' ||
                    triple.predicate === 'http://www.w3.org/ns/hydra/core#template' ||
                    triple.predicate === 'http://www.w3.org/ns/hydra/core#property' ||
                    triple.predicate === 'http://www.w3.org/ns/hydra/core#variable');
                const searchUriTriples = metaTriples.filter(triple => 
                    triple.predicate === 'http://www.w3.org/ns/hydra/core#search' &&
                    triple.subject === response.url);
                // look for all search template for the mapping
                searchUriTriples.forEach(searchUriTriple => {
                    let searchUri = searchUriTriple.object
                    // search for the lc:departureTimeQuery URI
                    const mappings = metaTriples.filter(triple => 
                        triple.subject === searchUri && 
                        triple.predicate === 'http://www.w3.org/ns/hydra/core#mapping');
                    const mappingsUri = mappings[0].object;
                    // TODO: filter on the right subject
                    const template = N3Util.getLiteralValue(metaTriples.filter(triple =>
                        triple.subject === searchUri && 
                        triple.predicate === 'http://www.w3.org/ns/hydra/core#template')[0].object);
                    const tpl = UriTemplate.parse(template);
                    const params = {};
                    params["departureTime"] = this.departureTime.toISOString();
                    const url = tpl.expand(params);
                    this.cache.get(url).then(response => {
                        this.store = new ConnectionsStore(response.url, response.triples);
                        this.push(this.store.connections.shift());
                    }, error => console.error(error));
                });
            }).catch(e => console.error(e));
            this.discoveryPhase = false;
        } else {
            // readConnection if still more available
            if (this.store.connections.length > 0) {
                this.push(this.store.connections.shift());
            } else {
                // fetch new page
                this.cache.get(this.store.nextPageIri).then(response => {
                    this.store = new ConnectionsStore(response.url, response.triples);
                    const connection = this.store.connections.shift();
                    this.push(connection);
                }, error => {
                    this.push(null, error);
                });
            }
        }
    }
}

module.exports = ConnectionsFetcher;