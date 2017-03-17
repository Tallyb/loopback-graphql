'use strict';

const _ = require('lodash');

const utils = require('./utils');
const base = require('./base');
const execution = require('./execution');
const promisify = require('promisify-node');

function RelationResolver(model) {
    let resolver = {};
    _.forEach(utils.sharedRelations(model), rel => {
        resolver[rel.name] = (obj, args, context) => {
            return execution.findRelated(rel, obj, args, context);
        };
    });

    return {
        [utils.singularModelName(model)]: resolver
    };
}

function rootResolver(model) {
    return {
        Query: {
            [`${utils.pluralModelName(model)}`]: (root, args, context) => {
                return execution.findAll(model, root, args, context);
            },
            [`${utils.singularModelName(model)}`]: (obj, args, context) => {
                return execution.findOne(model, obj, args, context);
            }
        },
        Mutation: {
            [`save${utils.singularModelName(model)}`]: (context, args) => {
                var instance = JSON.parse(JSON.stringify(args.obj));
                return model.upsert(instance);
            },
            [`delete${utils.singularModelName(model)}`]: (context, args) => {
                return model.findById(args.id)
                    .then(instance => instance.destroy());
            }
        }
    };
}

function connectionResolver(model, obj, args, context) {
    return {
        [utils.connectionTypeName(model)]: {
            totalCount: (obj, args, context) => {
                return obj.count;
            },

            edges: (obj, args, context) => {
                return _.map(obj.list, node => {
                    return {
                        cursor: utils.idToCursor(node[model.getIdName()]),
                        node: node
                    };
                });
            },

            [model.pluralModelName]: (obj, args, context) => {
                return obj.list;
            },

            pageInfo: (obj, args, context) => {
                let pageInfo = {
                    startCursor: null,
                    endCursor: null,
                    hasPreviousPage: false,
                    hasNextPage: false
                };
                if (obj.count > 0) {
                    pageInfo.startCursor = utils.idToCursor(obj.list[0][model.getIdName()]);
                    pageInfo.endCursor = utils.idToCursor(obj.list[obj.list.length - 1][model.getIdName()]);
                    pageInfo.hasNextPage = obj.list.length === obj.args.limit;
                    pageInfo.hasPreviousPage = obj.list[0][model.getIdName()] !== obj.first[model.getIdName()].toString();
                }
                return pageInfo;
            }
        }
    };
}

function remoteResolver(model) {
    var Mutation = {};
    //model.sharedClass.methods
    if (model.sharedClass && model.sharedClass.methods) {
        model.sharedClass.methods().map(function(method) {
            if (method.name.indexOf('Stream') === -1 && method.name.indexOf('invoke') === -1) {
                var acceptingParams = [];
                method.accepts.map(function(param) {
                    if (param.arg) {
                        acceptingParams.push(param.arg);
                    }
                });
                Mutation[`${method.name}${utils.singularModelName(model)}`] = (context, args) => {
                    var params = [];
                    acceptingParams.map(function(param) {
                        params.push(args[param]);
                    });
                    var wrap = promisify(model[method.name]);
                    return wrap.apply(model, params).then(function(data) {
                        return data;
                    });
                };
            }
        });
    }
    return {
        Mutation: Mutation
    };
}

/**
 * Generate resolvers for all models
 *
 * @param {Object} models: All loopback Models
 * @returns {Object} resolvers functions for base and all models - queries and mutations
 */
module.exports = function Resolvers(models) {
    return _.reduce(models, (obj, model) => {
        if (model.shared) {
            return _.merge(
                obj,
                rootResolver(model),
                connectionResolver(model),
                RelationResolver(model),
                remoteResolver(model)
            );
        }
        return obj;
    }, base.resolvers);
};
