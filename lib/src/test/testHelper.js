'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../../server/server");
function gqlRequest(query, variables) {
    chai.use(chaiHttp);
    return chai.request(server)
        .post('/graphql')
        .send({
        query: query,
        variables: variables,
    });
}
exports.gqlRequest = gqlRequest;
