'use strict';

const graphql = require('graphql-server-express');
const gqlTools = require('graphql-tools');
const bodyParser = require('body-parser');
//const _ = require('lodash');

const ast = require('./ast');
const resolvers = require('./resolvers');
const typeDefs = require('./typedefs');

module.exports = function(app, options) {
    const models = app.models();
    var types = ast(models);

    let schema = gqlTools.makeExecutableSchema({
        typeDefs: typeDefs(types),
        resolvers: resolvers(models),
        resolverValidationOptions: {
            requireResolversForAllFields: false
        }
    });

    let graphiqlPath = options.graphiqlPath || '/graphiql';
    let path = options.path || '/graphql';

    app.use(path, bodyParser.json(), graphql.graphqlExpress({
        schema: schema
    }));
    app.use(graphiqlPath, graphql.graphiqlExpress({
        endpointURL: path
    }));
};