'use strict';

var apollo = require('apollo-server');
var gqlTools = require('graphql-tools');
var bodyParser = require('body-parser');
var _ = require('lodash');

var query = require('./query.js');
var resolvers = require('./resolvers.js');
var mutations = require('./mutation');

module.exports = function (app, options) {
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
        `type Mutation { 
            ${mutations.generateSaves(models)}
            ${mutations.generateDeletes(models)}    
         }`,
        `schema {
                query: Query
                mutation: Mutation
            }`
    ];

    let schema = gqlTools.makeExecutableSchema({
        typeDefs,
        resolvers: resolvers.generateResolvers(models),
        resolverValidationOptions: {
            requireResolversForAllFields: false
        }
    });

    //let router = app.loopback.Router();
    let graphiqlPath = options.graphiqlPath || '/graphiql';
    let path = options.path || '/graphql';

    app.use(path, bodyParser.json(), apollo.apolloExpress({ schema: schema }));
    app.use(graphiqlPath, apollo.graphiqlExpress({
        endpointURL: path
    }));
};
