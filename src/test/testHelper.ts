'use strict';

import chai = require('chai');
import chaiHttp = require('chai-http');
import * as server from '../../server/server';

export function gqlRequest(query: any, variables?: any) {
  chai.use(chaiHttp);
  return chai.request(server)
    .post('/graphql')
    .send({
      query,
      variables,
    });
}
