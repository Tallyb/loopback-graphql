'use strict';
var Promise = require('bluebird');

var expect = require('chai').expect;
var chai = require('chai')
    .use(require('chai-http'));
var server = require('../server/server');
var cpx = require('cpx');

var gql = require('graphql-tag');
// var _ = require('lodash');

describe('mutation', () => {

    before(() => {
        return Promise.fromCallback((cb) => {
            return cpx.copy('./data.json', './data/', cb);
        });
    });

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

        return chai.request(server)
            .post('/graphql')
            .send({
                query,
                variables
            })
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
            id: 3
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

    it('should login and return an accessToken', () => {
        const query = gql `
          mutation login{
            loginUser(credentials:{username:"naveenmeher", password:"welcome"})
          }
        `;
        return chai.request(server)
            .post('/graphql')
            .send({
                query
            })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.have.deep.property('body.data.loginUser.id');
            });
    });

    it('should call a remoteHook and return the related data', () => {
        const query = gql `
        mutation a{
          findByIdCustomer(id:"1"){
            name
            age
            billingAddress {
              id
            }
            emailList {
              id
            }
            accountIds
            orders {
              edges {
                node {
                  id
                  date
                  description
                }
              }
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
                expect(res).to.have.deep.property('body.data.findByIdCustomer.name');
                expect(res).to.have.deep.property('body.data.findByIdCustomer.age');
                expect(res).to.have.deep.property('body.data.findByIdCustomer.orders.edges[0].node.id');
                expect(res).to.have.deep.property('body.data.findByIdCustomer.orders.edges[0].node.description');
            });
    });

});