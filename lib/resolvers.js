"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var utils = require("./utils");
var execution = require("./execution");
var GraphQLJSON = require("graphql-type-json");
var GraphQLDate = require("graphql-date");
var graphql_geojson_1 = require("graphql-geojson");
var scalarResolvers = {
    JSON: GraphQLJSON,
    Date: GraphQLDate,
    GeoPoint: graphql_geojson_1.CoordinatesScalar,
};
function RelationResolver(model) {
    var resolver = {};
    _.forEach(utils.sharedRelations(model), function (rel) {
        resolver[rel.name] = function (obj, args, context) {
            return execution.findRelated(rel, obj, args, context);
        };
    });
    return _a = {},
        _a[utils.singularModelName(model)] = resolver,
        _a;
    var _a;
}
function rootResolver(model) {
    return {
        Query: (_a = {},
            _a["" + utils.pluralModelName(model)] = function (root, args, context) {
                return execution.findAll(model, root, args, context);
            },
            _a["" + utils.singularModelName(model)] = function (obj, args, context) {
                return execution.findOne(model, obj, args, context);
            },
            _a),
        Mutation: (_b = {},
            _b["save" + utils.singularModelName(model)] = function (context, args) {
                return model.upsert(args.obj);
            },
            _b["delete" + utils.singularModelName(model)] = function (context, args) {
                return model.findById(args.id)
                    .then(function (instance) {
                    return instance ? instance.destroy() : null;
                });
            },
            _b),
    };
    var _a, _b;
}
function connectionResolver(model) {
    return _a = {},
        _a[utils.connectionTypeName(model)] = (_b = {
                totalCount: function (obj, args, context) {
                    return obj.count;
                },
                edges: function (obj, args, context) {
                    return _.map(obj.list, function (node) {
                        return {
                            cursor: utils.idToCursor(node[model.getIdName()]),
                            node: node,
                        };
                    });
                }
            },
            _b[model.pluralModelName] = function (obj, args, context) {
                return obj.list;
            },
            _b.pageInfo = function (obj, args, context) {
                var pageInfo = {
                    startCursor: null,
                    endCursor: null,
                    hasPreviousPage: false,
                    hasNextPage: false,
                };
                if (obj.count > 0) {
                    pageInfo.startCursor = utils.idToCursor(obj.list[0][model.getIdName()]);
                    pageInfo.endCursor = utils.idToCursor(obj.list[obj.list.length - 1][model.getIdName()]);
                    pageInfo.hasNextPage = obj.list.length === obj.args.limit;
                    pageInfo.hasPreviousPage = obj.list[0][model.getIdName()] !== obj.first[model.getIdName()].toString();
                }
                return pageInfo;
            },
            _b),
        _a;
    var _a, _b;
}
function remoteResolver(model) {
    var mutation = {};
    if (model.sharedClass && model.sharedClass.methods) {
        model.sharedClass._methods.map(function (method) {
            if (method.accessType !== 'READ' && method.http.path) {
                var acceptingParams_1 = [];
                method.accepts.map(function (param) {
                    if (param.arg) {
                        acceptingParams_1.push(param.arg);
                    }
                });
                mutation["" + utils.methodName(method, model)] = function (context, args) {
                    var params = [];
                    _.each(method.accepts, function (el, i) {
                        params[i] = args[el.arg];
                    });
                    return model[method.name].apply(model, params);
                };
            }
        });
    }
    return {
        Mutation: mutation,
    };
}
function resolvers(models) {
    return _.reduce(models, function (obj, model) {
        if (model.shared) {
            return _.merge(obj, rootResolver(model), connectionResolver(model), RelationResolver(model), remoteResolver(model));
        }
        return obj;
    }, scalarResolvers);
}
exports.resolvers = resolvers;
