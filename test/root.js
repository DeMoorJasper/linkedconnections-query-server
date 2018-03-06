const assert = require('assert');
const { getServerLocation, sendRequest, getResultData } = require('./init');

describe('Endpoint: /', function() {
  it('should respond to requests', async function() {
    const url = `${await getServerLocation()}`;
    const result = await sendRequest(url);

    assert(result.statusCode === 200);
    assert(await getResultData(result));
  });
});