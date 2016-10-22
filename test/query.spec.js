'use strict';
var Promise = require('bluebird');

var expect = require('chai').expect;
var chai = require('chai')
    .use(require('chai-http'));
var server = require('../server/server');
var cpx = require('cpx');

var gql = require('graphql-tag');
// var _ = require('lodash');

describe('query', () => {

    before(() => {
        return Promise.fromCallback((cb) => {
            return cpx.copy('./data.json', './data/', cb);
        });
    });

    it('should execute a plural query', () => {
        const notes = gql`
        query {
            Notes (first: 2) {
                title
                content
                id
            }
        }
        `;
        return chai.request(server)
            .post('/graphql')
            .send({ query: notes })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.data.Notes.length).to.equal(2);
            });
    });

    it('should execute a single query', () => {
        const notes = gql`
        query {
            Note (id: 1) {
                title
                content
                id
            }
        }
        `;
        return chai.request(server)
            .post('/graphql')
            .send({ query: notes })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.data.Note.id).to.equal(1);
            });
    });
});
