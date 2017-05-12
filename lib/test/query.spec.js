'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var testHelper_1 = require("./testHelper");
var graphql_tag_1 = require("graphql-tag");
describe('query', function () {
    describe('Single entity', function () {
        it('should execute a single query with relation', function () {
            var query = (_a = ["\n            query {\n              allOrders(first:1){\n                edges{\n                  node{\n                    date\n                    description\n                    customer{\n                      edges{\n                        node{\n                          name\n                          age\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }"], _a.raw = ["\n            query {\n              allOrders(first:1){\n                edges{\n                  node{\n                    date\n                    description\n                    customer{\n                      edges{\n                        node{\n                          name\n                          age\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }"], graphql_tag_1.default(_a));
            return testHelper_1.gqlRequest(query)
                .then(function (res) {
                chai_1.expect(res).to.have.status(200);
                var data = res.body.data;
                chai_1.expect(data.allOrders.edges.length).to.equal(1);
            });
            var _a;
        });
    });
    describe('Multiple entities', function () {
        it('should return response with where on id', function () {
            var query = (_a = ["\n                query users ($where:JSON){\n                  allUsers(where: $where) {\n                    totalCount\n                    edges {\n                      node {\n                        id\n                        email\n                      }\n                    }\n\n                  }\n      }"], _a.raw = ["\n                query users ($where:JSON){\n                  allUsers(where: $where) {\n                    totalCount\n                    edges {\n                      node {\n                        id\n                        email\n                      }\n                    }\n\n                  }\n      }"], graphql_tag_1.default(_a));
            var variables = {
                where: {
                    id: {
                        inq: [1, 2],
                    },
                },
            };
            return testHelper_1.gqlRequest(query, variables)
                .then(function (res) {
                chai_1.expect(res).to.have.status(200);
                chai_1.expect(res.body.data.allUsers.totalCount).to.equal(2);
            });
            var _a;
        });
    });
    describe('relationships', function () {
        it('should query related entity with nested relational data', function () {
            var query = (_a = ["\n                query {\n                 allCustomers(first:2){\n                   edges{\n                     node{\n                       name\n                       age\n                       orders{\n                         edges{\n                           node{\n                             date\n                             description\n                             customer{\n                               edges{\n                                 node{\n                                   name\n                                   age\n                                 }\n                               }\n                             }\n                           }\n                         }\n                       }\n                     }\n                   }\n                 }\n               }\n            "], _a.raw = ["\n                query {\n                 allCustomers(first:2){\n                   edges{\n                     node{\n                       name\n                       age\n                       orders{\n                         edges{\n                           node{\n                             date\n                             description\n                             customer{\n                               edges{\n                                 node{\n                                   name\n                                   age\n                                 }\n                               }\n                             }\n                           }\n                         }\n                       }\n                     }\n                   }\n                 }\n               }\n            "], graphql_tag_1.default(_a));
            return testHelper_1.gqlRequest(query)
                .then(function (res) {
                chai_1.expect(res).to.have.status(200);
                chai_1.expect(res.body.data.allCustomers.edges.length).to.equal(2);
            });
            var _a;
        });
    });
});
