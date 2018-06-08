const assert = require('assert');
const CacheFetcher = require('../lib/caching/CacheFetcher');
const LDFetch = require('ldfetch');

describe('Cache', function() {
  it('Should cache an uncached request', async function() {
    let cache = new CacheFetcher(new LDFetch());
    let requestUri = `http://belgium.linkedconnections.org/sncb/connections/?departureTime=2018-06-08T14%3A22%3A25.374Z`;
    await cache.get(requestUri);
    let cachedFile = await cache.readCache(requestUri);

    assert(cachedFile !== null);
  });
});