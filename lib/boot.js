'use strict';

var graphql = require('graphql-server-express');
var gqlTools = require('graphql-tools');
var bodyParser = require('body-parser');
//var _ = require('lodash');

var ast = require('./ast');
var resolvers = require('./resolvers');
var typeDefs = require('./typedefs');

module.exports = function(app, options) {
    const models = app.models();
    var types = ast(models);

    console.log(typeDefs(types));
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