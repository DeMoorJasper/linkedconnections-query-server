var N3Util = require('n3').Util;

class ConnectionsStore {
    constructor(documentIri, triples) {
        this.documentIri = documentIri;
        this.connections = [];
        this.addTriples(triples);
    }

    addTriples(triples) {
        // Find next page 
        // building block 1: every page should be a hydra:PagedCollection with a next and previous page link
        var nextPage = triples.filter(triple => {
            return triple.predicate === 'http://www.w3.org/ns/hydra/core#next' && triple.subject === this.documentIri;
        });
        this.nextPageIri = null;
        if (nextPage[0] && nextPage[0].object.substr(0, 4) === 'http') {
            this.nextPageIri = nextPage[0].object;
        }
        // group all entities together and 
        var entities = [];
        triples.forEach(triple => {
            if (!entities[triple.subject]) entities[triple.subject] = {};

            if (triple.predicate === "http://semweb.mmlab.be/ns/linkedconnections#departureTime") {
                triple.predicate = "departureTime";
                triple.object = new Date(N3Util.getLiteralValue(triple.object));
            }

            if (triple.predicate === "http://semweb.mmlab.be/ns/linkedconnections#departureDelay") {
                triple.predicate = "departureDelay";
                triple.object = N3Util.getLiteralValue(triple.object);
            }

            if (triple.predicate === "http://semweb.mmlab.be/ns/linkedconnections#arrivalDelay") {
                triple.predicate = "arrivalDelay";
                triple.object = N3Util.getLiteralValue(triple.object);
            }

            if (triple.predicate === "http://semweb.mmlab.be/ns/linkedconnections#arrivalTime") {
                triple.predicate = "arrivalTime";
                triple.object = new Date(N3Util.getLiteralValue(triple.object));
            }

            if (triple.predicate === "http://semweb.mmlab.be/ns/linkedconnections#departureStop") triple.predicate = "departureStop";

            if (triple.predicate === "http://semweb.mmlab.be/ns/linkedconnections#arrivalStop") triple.predicate = "arrivalStop";

            if (triple.predicate === "http://vocab.gtfs.org/terms#trip") triple.predicate = "gtfs:trip";

            entities[triple.subject][triple.predicate] = triple.object;
        });
        // Find all Connections
        // building block 2: every lc:Connection entity is taken from the page and processed
        var connections = [];
        Object.keys(entities).forEach(key => {
            if (entities[key]["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] &&
                entities[key]["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] === 'http://semweb.mmlab.be/ns/linkedconnections#Connection') {
                entities[key]["@id"] = key;
                connections.push(entities[key]);
            }
        });
        this.connections = connections.sort((connectionA, connectionB) => {
            return connectionA.departureTime.valueOf() - connectionB.departureTime.valueOf();
        });
    }

    getNextPageIri() {
        return this.nextPageIri;
    }

    getConnections() {
        return this.connections;
    }
}

module.exports = ConnectionsStore;