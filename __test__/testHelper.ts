'use strict';

import * as request from 'supertest';
import * as server from '../server/server.js';

export function gqlRequest(query: any, status: number, variables?: object) {
  return request(server)
    .post('/graphql')
    .send({
      query,
      variables,
    })
    .expect(status);
}
