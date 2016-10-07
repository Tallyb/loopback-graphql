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
        return m.shared;
    });

    let typeDefs = [
            'scalar Date',
            query.generateEnums(models),
            query.generateTypeDefs(models),
            mutations.generateInputs(models),
            `type Query { ${query.generateQueries(models)} }`,
            `type Mutation { ${mutations.generateSaves(models)} }`,
            `schema {
                query: Query
                mutation: Mutation
            }`
        ];

    let schema = gqlTools.makeExecutableSchema({
        typeDefs,
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
