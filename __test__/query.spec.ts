'use strict';
import { gqlRequest } from './testHelper';
import gql from 'graphql-tag';

describe('query', () => {

  describe('Single entity', () => {
    it('should execute a single query with relation', () => {
      const query = gql`
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
      return gqlRequest(query, 200, {})
        .then(res => {
          let data = res.body.data;
          expect(data.allOrders.edges.length).toEqual(1);
        });
    });
  });

  describe('Multiple entities', () => {
    it('should return response with where on id', () => {
      const query = gql`
                query users ($where:JSON){
                  allUsers(where: $where) {
                    totalCount
                    edges {
                      node {
                        id
                        email
                      }
                    }

                  }
      }`;
      const variables = {
        where: {
          id: {
            inq: [1, 2],
          },
        },
      };
      return gqlRequest(query, 200, variables)
        .then(res => {
          expect(res.body.data.allUsers.totalCount).toEqual(2);
        });

    });
  });

  describe('relationships', () => {
    it('should query related entity with nested relational data', () => {
      const query = gql`
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
      return gqlRequest(query, 200, {})
        .then(res => {
          expect(res.body.data.allCustomers.edges.length).toEqual(2);
        });
    });
  });

});
