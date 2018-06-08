const Planner = require('../query/Planner');
const logger = require('../Logger')();

async function promisifyQuery(planner, query) {
  return new Promise(async resolve => {
    let searchObject = await planner.search(query);
    
    // Return result
    searchObject.planner.once('result', (path) => {
      logger.log("[PLANNER]: Result found");
      resolve(path);
    });

    // Log connections found
    searchObject.planner.on("data", function (connection) {
      logger.verbose("[PLANNER]: Connection found");
    });
  });
}

exports.search = async function (config, query, callback) {
  const planner = new Planner(config);
  return callback(null, await promisifyQuery(planner, query));
};