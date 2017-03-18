'use strict';

var chai = require('chai')
    .use(require('chai-http'));
var server = require('../server/server');

function gqlRequest(query, variables) {

    return chai.request(server)
        .post('/graphql')
        .send({
            query,
            variables
        });

}

module.exports = {
    gqlRequest
};