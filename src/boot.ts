'use strict';

import {apolloExpress, graphiqlExpress } from 'apollo-server';
import {makeExecutableSchema} from 'graphql-tools';

import _ from 'lodash';
var gqlTools = require('graphql-tools');
var bodyParser = require('body-parser');

var modelSchema = require('./schema.js');
var modelResolvers = require('./resolvers.js');

export function graphql(app, noGraphiql) {
    //Need to filter only the public models
    const models = _.filter(app.models(), m => {
        return true;
    });

    let typeDefs = [`
    scalar Date
    ${modelSchema.generateEnums(models)}
    ${modelSchema.generateTypeDefs(models)}
    type Query { ${modelSchema.generateQueries(models)} }
    schema {
      query: Query
    }
    `];

    let resolvers = modelResolvers.generateResolvers(models);
    let schema = makeExecutableSchema({
        typeDefs,
        resolvers,
        resolverValidationOptions: {
            requireResolversForAllFields: false
        }
    });

    let router = app.loopback.Router();
    router.use('/graphql', bodyParser.json(), apolloExpress({ schema: schema }));
    if (!noGraphiql) {
        router.use('/graphiql', graphiqlExpress({
            endpointURL: '/graphql'
        }));
    }
    app.use(router);
};
