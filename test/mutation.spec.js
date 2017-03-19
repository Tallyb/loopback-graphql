'use strict';

var expect = require('chai').expect;
var chai = require('chai')
    .use(require('chai-http'));
var server = require('../server/server');
var testHelper = require('./testHelper');

var gql = require('graphql-tag');
// var _ = require('lodash');

describe('mutation', () => {

    it('should add a single entity', () => {
        const query = gql `
            mutation save ($obj: AuthorInput!) {
                saveAuthor (obj: $obj) {
                    first_name
                    last_name
                    birth_date
                }
           }
        `;
        const variables = {
            obj: {
                first_name: 'Virginia',
                last_name: 'Wolf',
                birth_date: new Date()
            }
        };

        return testHelper.gqlRequest(query, variables)
            .then(res => {
                expect(res).to.have.status(200);
            });
    });

    it('should add a single entity with sub type', () => {
        const body = 'Heckelbery Finn';
        const query = gql `
            mutation save ($obj: NoteInput!) {
                saveNote (obj: $obj) {
                    id
                    title
                    author {
                        first_name
                        last_name
                    }

                }
           }
        `;
        const variables = {
            obj: {
                title: 'Heckelbery Finn',
                authorId: 8,
                content: {
                    body: body,
                    footer: 'The end'
                }
            }
        };

        return testHelper.gqlRequest(query, variables)
            .then(res => {
                expect(res).to.have.status(200);
                //expect(res.body.data.content.body).to.equal(body);
            });
    });

    it('should delete a single entity', () => {
        const query = gql `
            mutation delete ($id: ID!) {
                deleteAuthor (id: $id) {
                    text
                }
           }
        `;
        const variables = {
            id: 7
        };

        return chai.request(server)
            .post('/graphql')
            .send({
                query,
                variables
            })
            .then(res => {
                expect(res).to.have.status(200);
            });
    });

    describe('remote methods', () => {

        const userInput = {
            email: 'John@a.com',
            password: '123456',
            username: 'John@a.com'
        };
        const createUser = `
          mutation userCreate ($obj: UserInput!) {
            saveUser ( obj: $obj ) {
              id
            }
          }
        `;

        const deleteUser = gql `
            mutation delete ($id: ID!) {
                deleteAuthor (id: $id) {
                    text
                }
           }
        `;
        let userId;

        beforeEach(() => {
            return testHelper.gqlRequest(createUser, {
                    obj: userInput
                })
                .then(res => {
                    userId = res.body.data.saveUser.id;
                });
        });

        afterEach(() => {
            return testHelper.gqlRequest(deleteUser, {
                id: userId
            });
        });
        it('should login and return an accessToken', () => {
            const query = gql `
          mutation login{
            UserLogin(credentials:{username:"naveenmeher", password:"welcome"})
          }
        `;
            return chai.request(server)
                .post('/graphql')
                .send({
                    query
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.UserLogin.id).not.to.be.empty;
                });
        });

    });

});
