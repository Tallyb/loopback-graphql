'use strict';

var expect = require('chai').expect;
var testHelper = require('./testHelper');

var gql = require('graphql-tag');
// var _ = require('lodash');

describe('Pagination', () => {

    before(() => {
    });

    it('should query first 2 entities', () => {
        const query = gql `{
                    allNotes(first: 2) {
                        totalCount
                        pageInfo {
                            hasNextPage
                            hasPreviousPage
                            startCursor
                            endCursor
                        }
                        edges {
                        node {
                            title
                            id
                        }
                        cursor
                        }
                        
                    }
                    }

        `;
        return testHelper.gqlRequest(query)
            .then(res => {
                expect(res).to.have.status(200);
                res = res.body.data;
                expect(res.allNotes.edges.length).to.be.above(0);
            });
    });

    it('should query entity after cursor', () => {
        const query = gql `{       
            allNotes (after: "Y29ubmVjdGlvbi40", first: 3) {
                pageInfo  {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                }
                edges {
                node {
                    id
                    title
                }
                cursor
                }
            }
        }`;
        return testHelper.gqlRequest(query)
            .then(res => {
                expect(res).to.have.status(200);
                res = res.body.data;
                expect(res.allNotes.edges.length).to.be.above(0);
                expect(res.allNotes.edges[0].node.id).to.be.above(4);
                expect(res.allNotes.pageInfo.hasPreviousPage).to.be.true;
            });
    });

    it('should query related entity on edge', () => {
        const query = gql `{
                allAuthors {
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                        startCursor
                        endCursor
                    }
                    edges {
                    node {
                        id
                        last_name
                        notes {
                        totalCount
                        Notes {
                            title
                        }
                        }
                    }
                    cursor
                    }
                }
                }
            `;
        return testHelper.gqlRequest(query)
            .then(res => {
                expect(res).to.have.status(200);
                res = res.body.data;
                expect(res.allAuthors.edges[0].node.notes.Notes.length).to.be.above(0);
                expect(res.allAuthors.edges[0].node.notes.totalCount).to.be.above(0);
                expect(res.allAuthors.edges[0].cursor).not.to.be.empty;
            });
    });

});