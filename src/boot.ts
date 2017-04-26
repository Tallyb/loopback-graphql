import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import * as bodyParser from 'body-parser';

import abstractTypes from './ast';
import resolvers from './resolvers';
import typeDefs from './typedefs';

export default function (app, options) {
  const models = app.models();
  let types = abstractTypes(models);
  let schema = makeExecutableSchema({
    typeDefs: typeDefs(types),
    resolvers: resolvers(models),
    resolverValidationOptions: {
      requireResolversForAllFields: false,
    },
  });

  let graphiqlPath = options.graphiqlPath || '/graphiql';
  let path = options.path || '/graphql';

  app.use(path, bodyParser.json(), graphqlExpress(req => {
    return {
      schema,
      context: req,
    };
  }));
  app.use(graphiqlPath, graphiqlExpress({
    endpointURL: path,
  }));
};
