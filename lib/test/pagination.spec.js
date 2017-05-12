"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var testHelper_1 = require("./testHelper");
var graphql_tag_1 = require("graphql-tag");
describe('Pagination', function () {
    it('should query first 2 entities', function () {
        var query = (_a = ["{\n                    allNotes(first: 2) {\n                        totalCount\n                        pageInfo {\n                            hasNextPage\n                            hasPreviousPage\n                            startCursor\n                            endCursor\n                        }\n                        edges {\n                        node {\n                            title\n                            id\n                        }\n                        cursor\n                        }\n                    }\n                    }\n\n        "], _a.raw = ["{\n                    allNotes(first: 2) {\n                        totalCount\n                        pageInfo {\n                            hasNextPage\n                            hasPreviousPage\n                            startCursor\n                            endCursor\n                        }\n                        edges {\n                        node {\n                            title\n                            id\n                        }\n                        cursor\n                        }\n                    }\n                    }\n\n        "], graphql_tag_1.default(_a));
        return testHelper_1.gqlRequest(query)
            .then(function (res) {
            chai_1.expect(res).to.have.status(200);
            var data = res.body.data;
            chai_1.expect(data.allNotes.edges.length).to.be.above(0);
        });
        var _a;
    });
    it('should query entity after cursor', function () {
        var query = (_a = ["{\n            allNotes (after: \"Y29ubmVjdGlvbi40\", first: 3) {\n                pageInfo  {\n                    hasNextPage\n                    hasPreviousPage\n                    startCursor\n                    endCursor\n                }\n                edges {\n                node {\n                    id\n                    title\n                }\n                cursor\n                }\n            }\n        }"], _a.raw = ["{\n            allNotes (after: \"Y29ubmVjdGlvbi40\", first: 3) {\n                pageInfo  {\n                    hasNextPage\n                    hasPreviousPage\n                    startCursor\n                    endCursor\n                }\n                edges {\n                node {\n                    id\n                    title\n                }\n                cursor\n                }\n            }\n        }"], graphql_tag_1.default(_a));
        return testHelper_1.gqlRequest(query)
            .then(function (res) {
            chai_1.expect(res).to.have.status(200);
            var data = res.body.data;
            chai_1.expect(data.allNotes.edges.length).to.be.above(0);
            chai_1.expect(data.allNotes.edges[0].node.id).to.be.above(4);
            data.allNotes.pageInfo.hasPreviousPage.should.be(true);
        });
        var _a;
    });
    it('should query related entity on edge', function () {
        var query = (_a = ["{\n                allAuthors {\n                    pageInfo {\n                        hasNextPage\n                        hasPreviousPage\n                        startCursor\n                        endCursor\n                    }\n                    edges {\n                    node {\n                        id\n                        last_name\n                        notes {\n                        totalCount\n                        Notes {\n                            title\n                        }\n                        }\n                    }\n                    cursor\n                    }\n                }\n                }\n            "], _a.raw = ["{\n                allAuthors {\n                    pageInfo {\n                        hasNextPage\n                        hasPreviousPage\n                        startCursor\n                        endCursor\n                    }\n                    edges {\n                    node {\n                        id\n                        last_name\n                        notes {\n                        totalCount\n                        Notes {\n                            title\n                        }\n                        }\n                    }\n                    cursor\n                    }\n                }\n                }\n            "], graphql_tag_1.default(_a));
        return testHelper_1.gqlRequest(query)
            .then(function (res) {
            chai_1.expect(res).to.have.status(200);
            var data = res.body.data;
            chai_1.expect(data.allAuthors.edges[0].node.notes.Notes.length).to.be.above(0);
            chai_1.expect(data.allAuthors.edges[0].node.notes.totalCount).to.be.above(0);
            data.allAuthors.edges[0].cursor.should.not.to.be.empty();
        });
        var _a;
    });
});
