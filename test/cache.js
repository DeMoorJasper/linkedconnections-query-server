const assert = require('assert');
const CacheFetcher = require('../lib/caching/cacheFetcher');
const LDFetch = require('ldfetch');

describe('Cache', function() {
  it('Should cache an uncached request', async function() {
    let cache = new CacheFetcher(new LDFetch());

    cache.get('http://belgium.linkedconnections.org/sncb/connections/?departureTime=2018-06-08T14%3A22%3A25.374Z');
  });
});