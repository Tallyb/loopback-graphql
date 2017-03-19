'use strict';

var expect = require('chai').expect;
var testHelper = require('./testHelper');

var gql = require('graphql-tag');
// var _ = require('lodash');

describe('mutation', () => {

    it('should add and Delete single entity', () => {
        let id;
        const createAuthor = gql `
            mutation save ($obj: AuthorInput!) {
                saveAuthor (obj: $obj) {
                    first_name
                    last_name
                    birth_date
                    id
                }
           }
        `;
        const authorInput = {
            first_name: 'Virginia',
            last_name: 'Wolf',
            birth_date: new Date()
        };
        const deleteAuthor = gql `
            mutation delete ($id: ID!) {
                deleteAuthor (id: $id) {
                    text
                }
           }
        `;

        return testHelper.gqlRequest(createAuthor, {
                obj: authorInput
            })
            .then(res => {
                expect(res).to.have.status(200);
                id = res.body.data.saveAuthor.id;
                return testHelper.gqlRequest(deleteAuthor, {
                    id: id
                });
            })
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

    describe('remote methods', () => {

        const userInput = {
            email: 'John@a.com',
            password: '123456',
            username: 'John@a.com'
        };
        const createUser = `
            mutation userCreate ( $obj: UserInput! ){
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
            return testHelper.gqlRequest(query)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.UserLogin.id).not.to.be.empty;
                });
        });

    });

});