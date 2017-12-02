# Linked connections query server
A performance experiment to see how much difference it would make to have a caching/calculation server in place to calculate routes, fetch lc-data and cache this data.

## About
Based on the [linkedconnections client.js](https://github.com/linkedconnections/client.js).
Basically doing the same but on the server side, with caching logic in place as well as endpoints for clients to send requests to.

## Example requests
Simple request from Brussel-Noord to Roeselare

``
localhost:3000/query?q={"entrypoints":["http://belgium.linkedconnections.org/sncb/connections"],"departureStop":"http://irail.be/stations/NMBS/008812005","arrivalStop":"http://irail.be/stations/NMBS/008896800","departureTime":"2017-07-21T17:34:17.000Z","minimumTransferTime":6}
``

Complete request from Brussel-Noord to Gent-Sint-Pieters

``
localhost:3000/query?q={"entrypoints":["http://belgium.linkedconnections.org/sncb/connections"],"departureStop":"http://irail.be/stations/NMBS/008812005","arrivalStop":"http://irail.be/stations/NMBS/008892007","latestDepartTime":"2017-07-21T17:34:17.000Z","departureTime":"2017-07-21T16:34:17.000Z","minimumTransferTime":6,"searchTimeOut":60000}
``

## Results
Performance becomes better the more data gets cached, outperforming lc-client at a certain point and definitely intresting once you keep in mind some users might have a slow network or low compute power (smartphones,...) and would have a long waiting time for results, for these users this method will always outperform client side calculations and fetching. (If hosted on a decent server with SSD storage and solid internet connection).

Another benefit to users is the fact that most users query the same times at the same moment (the now), for example: Someone in Ghent queries Ghent to Brussels, meanwhile someone in Leuven queries to Antwerp. Both these trips share data fragments, so once the first user has queried the second one actually rides along the cache of the first user resulting in a more pleasant experience for both.

Results of one test query:
Without cache: 3650ms
With cache: 650ms

## License
MIT License