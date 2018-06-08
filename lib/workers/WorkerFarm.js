const Farm = require('worker-farm/lib/farm');
const promisify = require('../utils/promisify');
const fs = require('fs-extra');
const logger = require('../Logger')();

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

  async receive(data) {
    if (data.type) {
      switch(data.type) {
        case 'fs':
          try {
            await fs[data.function](...data.args);
          } catch(e) {
            logger.error(err);
          }
          break;
        case 'logger':
          logger[data.function](...data.args);
          break;
      }
    } else if (this.children[data.child]) {
      super.receive(data);
    }
  }

  async stop() {
    return new Promise(resolve => {
      this.end(resolve);
    });
  }
}

module.exports = WorkerFarm;