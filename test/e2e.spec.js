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

    it('should add a single entity', () => {
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
                first_name: 'Virginia',
                last_name: 'Wolf',
                birth_date: new Date()
            }
        };

        return chai.request(server)
            .post('/graphql')
            .send({ query: author, variables: values })
            .then(res => {
                expect(res).to.have.status(200);
            });
    });

    it('should add a single entity with sub type', () => {
        const body = 'Heckelbery Finn';
        const author = gql`
            mutation save ($obj: NoteInput!) {
                saveNote (obj: $obj) {
                    id
                    title
                    content {
                        body
                    }
                }
           }
        `;
        const values = {
            obj: {
                title: 'Heckelbery Finn',
                authorId: 8,
                content: {
                    body: body,
                    footer: 'The end'
                }
            }
        };

        return chai.request(server)
            .post('/graphql')
            .send({ query: author, variables: values })
            .then(res => {
                expect(res).to.have.status(200);
                //expect(res.body.data.content.body).to.equal(body);
            });
    });

    it('should delete a single entity', () => {
        const author = gql`
            mutation delete ($id: ID!) {
                deleteAuthor (id: $id) {
                    text
                }
           }
        `;
        const values = {
            id: 4
        };

        return chai.request(server)
            .post('/graphql')
            .send({ query: author, variables: values })
            .then(res => {
                expect(res).to.have.status(200);
            });
    });
});
