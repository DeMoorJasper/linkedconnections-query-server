const assert = require('assert');
const CacheFetcher = require('../lib/caching/CacheFetcher');
const LDFetch = require('ldfetch');
const { getCurrentDate, sleep } = require('./utils');

const requestNow = `http://belgium.linkedconnections.org/sncb/connections/?departureTime=${getCurrentDate()}`;
const cache = new CacheFetcher(new LDFetch(), {
  pageLength: 10000,
  timeout: 8000
});

describe('Cache', function() {
  it('Should cache an uncached request', async function() {
    await cache.get(requestNow);
    let cachedFile = await cache.readCache(requestNow);

    assert(cachedFile !== null, 'Should have cached the request');
  });

  it('Should invalidate cache for recent fragments', async function() {
    await cache.get(requestNow);
    let cachedFile = await cache.readCache(requestNow);
    assert(cachedFile !== null, 'Should have cached the request');
    await sleep(8000);
    cachedFile = await cache.readCache(requestNow);
    assert(cachedFile === null, 'Should have invalidated cache');
  });

  it('Should invalidate cache for old fragments', async function() {
    let oldDate = new Date();
    oldDate.setHours(oldDate.getHours() - 1);
    oldDate = oldDate.toISOString();
    const requestUri = `http://belgium.linkedconnections.org/sncb/connections/?departureTime=${oldDate}`;
    await cache.get(requestUri);
    let cachedFile = await cache.readCache(requestUri);
    assert(cachedFile !== null, 'Should have cached the request');
    await sleep(10000);
    cachedFile = await cache.readCache(requestUri);
    assert(cachedFile !== null, 'Should not timeout, if page is older than pageLength');
  });
});