'use strict';

//var graphql = require('graphql-server-express');
// var gqlTools = require('graphql-tools');
var graphql = require('graphql');
var graphqlHTTP = require('express-graphql');

var resolvers = require('./resolvers');
var typeDefs = require('./typedefs');

module.exports = function(app, options) {
    const models = app.models();

    let schema = graphql.buildSchema(typeDefs(models));

    let path = options.path || '/graphql';

    app.use(path, graphqlHTTP({
        schema: schema,
        rootValue: resolvers(models),
        graphiql: options.graphiqlPath || true
    }));
};