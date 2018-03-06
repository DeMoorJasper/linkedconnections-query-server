const assert = require('assert');
const { getServerLocation, sendRequest, getResultData } = require('./init');
const rimraf = require('rimraf');
const Path = require('path');

describe('Endpoint: /query', function() {
  it('should respond to requests', async function() {
    const url = `${await getServerLocation()}/query`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
  });

  it('should throw error on no query', async function() {
    const url = `${await getServerLocation()}/query`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    const resultJson = JSON.parse(await getResultData(result));
    assert(resultJson.error === 'Please provide valid JSON');
  });

  it('should throw error on invalid entrypoint', async function() {
    const query = {
      entrypoints: ['http://invalidentrypoint.com']
    };
    const url = `${await getServerLocation()}/query?q=${JSON.stringify(query)}`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    const resultJson = JSON.parse(await getResultData(result));
    assert(resultJson.error === 'One or more of these entrypoints are not whitelisted!');
  });

  it('should throw error on no departureTime', async function() {
    const query = {
      entrypoints: ['http://belgium.linkedconnections.org/sncb/connections']
    };
    const url = `${await getServerLocation()}/query?q=${JSON.stringify(query)}`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    const resultJson = JSON.parse(await getResultData(result));
    assert(resultJson.error === 'Please provide a departure time');
  });

  it('should throw error on no departureStop', async function() {
    const query = {
      entrypoints: ['http://belgium.linkedconnections.org/sncb/connections'],
      departureTime: Date.now()
    };
    const url = `${await getServerLocation()}/query?q=${JSON.stringify(query)}`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    const resultJson = JSON.parse(await getResultData(result));
    assert(resultJson.error === 'Please provide a departure stop');
  });

  it('should throw error on no arrivalStop', async function() {
    const query = {
      entrypoints: ['http://belgium.linkedconnections.org/sncb/connections'],
      departureTime: Date.now(),
      departureStop: 'http://irail.be/stations/NMBS/008812005'
    };
    const url = `${await getServerLocation()}/query?q=${JSON.stringify(query)}`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    const resultJson = JSON.parse(await getResultData(result));
    assert(resultJson.error === 'Please provide a arrival stop');
  });

  it('should respond to a valid query without cache', async function() {
    this.timeout(50000);

    // Remove all cache files
    rimraf.sync(Path.join(__dirname, '../.cache'));
    
    const query = {
      entrypoints: ['http://belgium.linkedconnections.org/sncb/connections'],
      departureTime: new Date(),
      departureStop: 'http://irail.be/stations/NMBS/008812005',
      arrivalStop: 'http://irail.be/stations/NMBS/008892007'
    };
    const url = `${await getServerLocation()}/query?q=${JSON.stringify(query)}`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    const resultJson = JSON.parse(await getResultData(result));
    assert(!resultJson.error);
  });

  it('should respond to a valid query with cache', async function() {
    this.timeout(50000);
    const query = {
      entrypoints: ['http://belgium.linkedconnections.org/sncb/connections'],
      departureTime: new Date(),
      departureStop: 'http://irail.be/stations/NMBS/008812005',
      arrivalStop: 'http://irail.be/stations/NMBS/008892007'
    };
    const url = `${await getServerLocation()}/query?q=${JSON.stringify(query)}`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    const resultJson = JSON.parse(await getResultData(result));
    assert(!resultJson.error);
  });
});