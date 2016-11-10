'use strict';
var Promise = require('bluebird');

var expect = require('chai').expect;
var chai = require('chai')
    .use(require('chai-http'));
var server = require('../server/server');
var cpx = require('cpx');

var gql = require('graphql-tag');
// var _ = require('lodash');

describe('Pagination', () => {

    before(() => {
        return Promise.fromCallback((cb) => {
            return cpx.copy('./data.json', './data/', cb);
        });
    });

    it('should query related entity', () => {
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
        return chai.request(server)
            .post('/graphql')
            .send({
                query
            })
            .then(res => {
                expect(res).to.have.status(200);
                res = res.body.data;
                console.log('RES', res);
                expect(res.allNotes.edges.length).to.be.above(0);
            });
    });

    it('should query related entity', () => {
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
        return chai.request(server)
            .post('/graphql')
            .send({
                query
            })
            .then(res => {
                expect(res).to.have.status(200);
                res = res.body.data;
                console.log('RES', res);
                expect(res.allNotes.edges.length).to.be.above(0);
                expect(res.allNotes.edges[0].node.id).to.be.above(4);
                expect(res.allNotes.pageInfo.hasPreviousPage).to.be.true;
            });
    });
});