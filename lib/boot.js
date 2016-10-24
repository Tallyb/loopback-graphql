'use strict';

var graphql = require('graphql-server-express');
var gqlTools = require('graphql-tools');
var bodyParser = require('body-parser');
//var _ = require('lodash');

var resolvers = require('./resolvers');
var typeDefs = require('./typedefs');

module.exports = function (app, options) {
    const models = app.models();
    let schema = gqlTools.makeExecutableSchema({
        typeDefs: typeDefs.generateTypeDefs(models),
        resolvers: resolvers.generateResolvers(models),
        resolverValidationOptions: {
            requireResolversForAllFields: false
        }
    });

    let graphiqlPath = options.graphiqlPath || '/graphiql';
    let path = options.path || '/graphql';

    app.use(path, bodyParser.json(), graphql.graphqlExpress({ schema: schema }));
    app.use(graphiqlPath, graphql.graphiqlExpress({
        endpointURL: path
    }));
};
