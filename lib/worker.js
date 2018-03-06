const Query = require('./query/query');

exports.search = async function (config, query, callback) {
  const planner = new Query(config);

  planner.search(query).then((events) => {
    events.planner.once('result', (path) => {
      console.log("[PLANNER]: Result found");
      callback(null, path);
    });
    // Keep event to prevent planner from going to take a nap
    events.planner.on("data", function (connection) {
      console.log("[PLANNER]: Connection found");
    });
  });
};