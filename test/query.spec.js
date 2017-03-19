'use strict';
var expect = require('chai').expect;
var gql = require('graphql-tag');
var testHelper = require('./testHelper');

describe('query', () => {

    before(() => {
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
            return testHelper.gqlRequest(query)
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
            return testHelper.gqlRequest(query)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.allCustomers.edges.length).to.equal(2);
                });
        });
    });

});
