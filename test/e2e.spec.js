'use strict';
var expect = require('chai').expect;
var chai = require('chai')
    .use(require('chai-http'));
var server = require('../server/server');

var gql = require('graphql-tag');
// var _ = require('lodash');

describe('query', () => {

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

        return chai.request(server)
            .post('/graphql')
            .send({query: notes})
            .then(res => {
                expect(res).to.have.status(200);
            });
    });

    it('should add an author', () => {
        const author = gql`
            mutation save ($obj: AuthorInput!) {
  saveAuthor (obj: $obj) {
	first_name
    last_name
    birth_date
        }
    }

        `;
        const values = {
            obj:
                {
                    first_name:'Virginia',
                    last_name: 'Wolf',
                    birth_date: new Date()
                }
        };

        return chai.request(server)
            .post('/graphql')
            .send({query: author, variables:values})
            .then(res => {
                expect(res).to.have.status(200);
                console.log('RES', res.body);
            }, err => console.log(err));
    });
});
