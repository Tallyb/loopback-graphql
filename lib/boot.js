'use strict';

var apollo = require('apollo-server');
var gqlTools = require('graphql-tools');
var bodyParser = require('body-parser');
var _ = require('lodash');

var query = require('./query.js');
var resolvers = require('./resolvers.js');
var mutations = require('./mutation');

function boot (app, noGraphiql) {
    //Need to filter only the public models
    const models = _.filter(app.models(), m => {
        return true;
    });

    console.log (mutations.generateSaves)
    let schema = gqlTools.makeExecutableSchema({
        typeDefs: [`
            scalar Date
            ${query.generateEnums(models)}
            ${query.generateTypeDefs(models)}
            type Query { ${query.generateQueries(models)} }
            schema {
                query: Query
            }
        `],
        resolvers : resolvers.generateResolvers(models),
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
