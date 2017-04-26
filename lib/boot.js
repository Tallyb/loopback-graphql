"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_server_express_1 = require("graphql-server-express");
var graphql_tools_1 = require("graphql-tools");
var bodyParser = require("body-parser");
var ast_1 = require("./ast");
var resolvers_1 = require("./resolvers");
var typedefs_1 = require("./typedefs");
function default_1(app, options) {
    var models = app.models();
    var types = ast_1.default(models);
    var schema = graphql_tools_1.makeExecutableSchema({
        typeDefs: typedefs_1.default(types),
        resolvers: resolvers_1.default(models),
        resolverValidationOptions: {
            requireResolversForAllFields: false,
        },
    });
    var graphiqlPath = options.graphiqlPath || '/graphiql';
    var path = options.path || '/graphql';
    app.use(path, bodyParser.json(), graphql_server_express_1.graphqlExpress(function (req) {
        return {
            schema: schema,
            context: req,
        };
    }));
    app.use(graphiqlPath, graphql_server_express_1.graphiqlExpress({
        endpointURL: path,
    }));
}
exports.default = default_1;
;
//# sourceMappingURL=boot.js.map