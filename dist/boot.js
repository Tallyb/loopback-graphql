'use strict';
const apollo_server_1 = require('apollo-server');
const graphql_tools_1 = require('graphql-tools');
const body_parser_1 = require('body-parser');
const schema_1 = require('./schema');
const resolvers_1 = require('./resolvers');
const lodash_1 = require('lodash');
function graphql(app, noGraphiql) {
    const models = lodash_1.default.filter(app.models(), m => {
        return true;
    });
    let typeDefs = [`
    scalar Date
    ${schema_1.default.generateEnums(models)}
    ${schema_1.default.generateTypeDefs(models)}
    type Query { ${schema_1.default.generateQueries(models)} }
    schema {
      query: Query
    }
    `];
    let resolvers = resolvers_1.default.generateResolvers(models);
    let schema = graphql_tools_1.makeExecutableSchema({
        typeDefs,
        resolvers,
        resolverValidationOptions: {
            requireResolversForAllFields: false
        }
    });
    let router = app.loopback.Router();
    router.use('/graphql', body_parser_1.json(), apollo_server_1.apolloExpress({ schema: schema }));
    if (!noGraphiql) {
        router.use('/graphiql', apollo_server_1.graphiqlExpress({
            endpointURL: '/graphql'
        }));
    }
    app.use(router);
}
exports.graphql = graphql;
;
//# sourceMappingURL=boot.js.map