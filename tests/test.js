let start = new Date("2017-07-21T18:34:17+02:00");
let q = {
    departureStop: "http://irail.be/stations/NMBS/008812005",
    arrivalStop: "http://irail.be/stations/NMBS/008892007",
    latestDepartTime: new Date(start.valueOf() + 60 * 60 * 1000),
    departureTime: start,
    minimumTransferTime: 6,
    searchTimeOut: 60000
};
let config = { 'entrypoints': ["http://belgium.linkedconnections.org/sncb/connections"] };

const Query = require('../lib/query/query');
const planner = new Query(config);

try {
    planner.search(q).then((events) => {
        events.planner.once('result', (path) => {
            console.log("[PLANNER]: Result found");
            // console.log(path);
        });
        // Keep event to prevent planner from going to take a nap
        events.planner.on("data", function (connection) {
            // console.log("[PLANNER]: Connection found");
        });
    });
} catch(e) {
    console.log(e);
}
