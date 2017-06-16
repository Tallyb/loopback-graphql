'use strict';

import request from 'supertest';
import app from '../server/server.js';

export function gqlRequest(query: any, status: number, variables?: object) {

  return request(app)
    .post('/graphql')
    .send({
      query,
      variables,
    })
    .expect(status);
}
