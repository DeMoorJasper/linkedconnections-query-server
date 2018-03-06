const Planner = require('../query/Planner');

async function promisifyQuery(planner, query) {
  return new Promise(resolve => {
    planner.search(query).then((events) => {
      events.planner.once('result', (path) => {
        console.log("[PLANNER]: Result found");
        resolve(path);
      });
      // Keep event to prevent planner from going to take a nap
      events.planner.on("data", function (connection) {
        console.log("[PLANNER]: Connection found");
      });
    });
  });
}

exports.search = async function (config, query, callback) {
  const planner = new Planner(config);
  return callback(null, await promisifyQuery(planner, query));
};