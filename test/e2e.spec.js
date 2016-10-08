'use strict';
//var testHelper = require('./test.helpers');
var expect = require('chai').expect;
var chai = require('chai')
    .use(require('chai-http'));

var gql = require('graphql-tag');
// var _ = require('lodash');
//var server;

describe('query', () => {
    // before( function (done) {
    //     return testHelper.getServer()
    //         .then((ser) => {
    //             server = ser;
    //         }, (err) => {
    //             console.log('error in starting server');
    //         }).asCallback(done);
    // });

    it('should execute a single query', () => {
        const notes = gql`
        query {
            Notes {
                title
                content
                id
            }
        }
        `;

        return chai.request('localhost:3000')
            .post('/graphql')
            .send({query: notes})
            .then(res => {
                expect(res).to.have.status(200);
                console.log('RES', res.body);
                expect(res.body.data.Notes.length).to.equal(4);
            });
    });

});
