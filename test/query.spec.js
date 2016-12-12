'use strict';
var expect = require('chai').expect;
var chai = require('chai')
    .use(require('chai-http'));
var server = require('../server/server');
var gql = require('graphql-tag');
var Promise = require('bluebird');
var cpx = require('cpx');

describe('query', () => {

    before(() => {
        return Promise.fromCallback((cb) => {
            return cpx.copy('./data.json', './data/', cb);
        });
    });

    describe('Single entity', () => {
        it('should execute a single query with relation', () => {
            const query = gql `
            query {
              allOrders(first:1){
                edges{
                  node{
                    date
                    description
                    customer{
                      edges{
                        node{
                          name
                          age
                        }
                      }
                    }
                  }
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
                    let result = res.body.data;
                    expect(result.allOrders.edges.length).to.equal(1);
                });
        });
    });
    describe('relationships', () => {
        it('should query related entity with nested relational data', () => {
            const query = gql `
                query {
                 allCustomers(first:2){
                   edges{
                     node{
                       name
                       age
                       orders{
                         edges{
                           node{
                             date
                             description
                             customer{
                               edges{
                                 node{
                                   name
                                   age
                                 }
                               }
                             }
                           }
                         }
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
                    expect(res.body.data.allCustomers.edges.length).to.equal(2);
                });
        });
    });

});
