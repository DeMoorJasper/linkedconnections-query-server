# Linked connections query server

![Travis](https://travis-ci.org/DeMoorJasper/linkedconnections-query-server.svg?branch=master)

A performance experiment to see how much difference it would make to have a caching/calculation server in place to calculate routes, fetch lc-data and cache this data.

## About

Based on the [linkedconnections client.js](https://github.com/linkedconnections/client.js).
Basically doing the same but on the server side, with caching logic in place as well as endpoints for clients to send requests to.

## Example requests

Simple request from Brussel-Noord to Roeselare

``
localhost:3000/query?q={"entrypoints":["http://belgium.linkedconnections.org/sncb/connections"],"departureStop":"http://irail.be/stations/NMBS/008812005","arrivalStop":"http://irail.be/stations/NMBS/008896800","departureTime":"2018-07-21T17:34:17.000Z","minimumTransferTime":6}
``

Complete request from Brussel-Noord to Gent-Sint-Pieters

``
localhost:3000/query?q={"entrypoints":["http://belgium.linkedconnections.org/sncb/connections"],"departureStop":"http://irail.be/stations/NMBS/008812005","arrivalStop":"http://irail.be/stations/NMBS/008892007","latestDepartTime":"2018-07-21T17:34:17.000Z","departureTime":"2018-07-21T16:34:17.000Z","minimumTransferTime":6,"searchTimeOut":60000}
``

## Results

This server makes it fast and easy to query routes using linkedconnections. Thanks to the workers and cache that are build-in this can be done in parallel at a speed that makes it usable for daily use, even outperforming some of the public transport routeplanners that are available at the moment.

For future scaling and even faster responses, this project can be extended to cache responses as well instead of only caching linked data files. However to query this in a very profitable way this should be stored in a database like for example mongoDB, changing the query endpoint, to first query the database for the requested route, before calculating any route, potentially saving a lot of processing power on the server.

### Benchmark

| with cache | without cache |
|------------|---------------|
| 650ms      | 3650ms        |

## License

MIT License