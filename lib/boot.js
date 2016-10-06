'use strict';

var apollo = require('apollo-server');
var gqlTools = require('graphql-tools');
var bodyParser = require('body-parser');

var _ = require('lodash');
var query = require('./query.js');
var modelResolvers = require('./resolvers.js');

function boot (app, noGraphiql) {
    //Need to filter only the public models
    const models = _.filter(app.models(), m => {
        return true;
    });

    let typeDefs = [`
    scalar Date
    ${query.generateEnums(models)}
    ${query.generateTypeDefs(models)}
    type Query { ${query.generateQueries(models)} }
    schema {
      query: Query
    }
    `];

    let resolvers = modelResolvers.generateResolvers(models);
    let schema = gqlTools.makeExecutableSchema({
        typeDefs,
        resolvers,
        resolverValidationOptions: {
            requireResolversForAllFields: false
        }
    });

    let router = app.loopback.Router();
    router.use('/graphql', bodyParser.json(), apollo.apolloExpress({ schema: schema }));
    if (!noGraphiql) {
        router.use('/graphiql', apollo.graphiqlExpress({
            endpointURL: '/graphql'
        }));
    }
    app.use(router);
}

module.exports = {
    boot
};
