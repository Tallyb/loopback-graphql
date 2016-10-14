'use strict';

var apollo = require('apollo-server');
var gqlTools = require('graphql-tools');
var bodyParser = require('body-parser');
var _ = require('lodash');

var resolvers = require('./resolvers');
var typeDefs = require('./typedefs');

module.exports = function (app, options) {
    const models = _.filter(app.models(), m => {
        return m.shared;
    });

    let schema = gqlTools.makeExecutableSchema({
        typeDefs: typeDefs.generateTypeDefs(models),
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
