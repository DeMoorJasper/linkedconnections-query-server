const { EventEmitter } = require('events');
const Farm = require('worker-farm/lib/farm');
const promisify = require('./promisify');

class WorkerFarm extends Farm {
  constructor() {
    super({}, require.resolve('./worker'));
    this.remoteWorker = this.promisifyWorker(this.setup(['search']));
  }

  promisifyWorker(worker) {
    let res = {};

    for (let key in worker) {
      res[key] = promisify(worker[key].bind(worker));
    }

    return res;
  }

  async search(...args) {
    return this.remoteWorker.search(...args);
  }
}

module.exports = WorkerFarm;