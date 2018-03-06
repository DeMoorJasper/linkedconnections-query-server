const assert = require('assert');
const { getServerLocation, sendRequest, getResultData } = require('./init');

describe('Endpoint: /entrypoints', function() {
  it('should respond to requests', async function() {
    const url = `${await getServerLocation()}/entrypoints`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
  });

  it('should respond with available entrypoints', async function() {
    const url = `${await getServerLocation()}/entrypoints`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    assert.deepEqual(JSON.parse(await getResultData(result)), ['http://belgium.linkedconnections.org/sncb/connections']);
  });
});