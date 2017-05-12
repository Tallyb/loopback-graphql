import { expect, should } from 'chai';
import { gqlRequest } from './testHelper';
import gql from 'graphql-tag';
// var _ = require('lodash');

describe('Pagination', () => {


  it('should query first 2 entities', () => {
    const query = gql`{
                    allNotes(first: 2) {
                        totalCount
                        pageInfo {
                            hasNextPage
                            hasPreviousPage
                            startCursor
                            endCursor
                        }
                        edges {
                        node {
                            title
                            id
                        }
                        cursor
                        }
                    }
                    }

        `;
    return gqlRequest(query)
      .then(res => {
        expect(res).to.have.status(200);
        let data: any = res.body.data;
        expect(data.allNotes.edges.length).to.be.above(0);
      });
  });

  it('should query entity after cursor', () => {
    const query = gql`{
            allNotes (after: "Y29ubmVjdGlvbi40", first: 3) {
                pageInfo  {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                }
                edges {
                node {
                    id
                    title
                }
                cursor
                }
            }
        }`;
    return gqlRequest(query)
      .then(res => {
        expect(res).to.have.status(200);
        let data: any = res.body.data;
        expect(data.allNotes.edges.length).to.be.above(0);
        expect(data.allNotes.edges[0].node.id).to.be.above(4);
        expect(data.allNotes.pageInfo.hasPreviousPage).to.equal(true);
      });
  });

  it('should query related entity on edge', () => {
    const query = gql`{
                allAuthors {
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                        startCursor
                        endCursor
                    }
                    edges {
                    node {
                        id
                        last_name
                        notes {
                        totalCount
                        Notes {
                            title
                        }
                        }
                    }
                    cursor
                    }
                }
                }
            `;
    return gqlRequest(query)
      .then(res => {
        expect(res).to.have.status(200);
        let data: any = res.body.data;
        expect(data.allAuthors.edges[0].node.notes.Notes.length).to.be.above(0);
        expect(data.allAuthors.edges[0].node.notes.totalCount).to.be.above(0);
        //data.allAuthors.edges[0].cursor.should.not.to.be.empty();
      });
  });

});
