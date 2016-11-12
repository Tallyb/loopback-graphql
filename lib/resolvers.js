'use strict';

var _ = require('lodash');

//var utils = require('./utils');
var base = require('./base');
var connections = require('./connections');

function relationsResolvers(model) {
    let resolver = {};
    _.forEach(model.relations, rel => {
        if (rel.modelTo.shared) {
            resolver[rel.name] = (obj, args, context) => {
                return connections.findRelation(rel, obj, args, context);
            };
        }
    });
    return resolver;
}

function queryResolvers(model) {
    return {
        Query: {
            [`all${_.upperFirst(model.pluralModelName)}`]: (obj, args, context) => {
                return connections.findAll(model, obj, args, context);
            },
            [model.modelName]: (obj, args, context) => {
                return model.findById(obj.id);
            }
        }
    };
}

function mutationResolvers(model) {
    let name = _.upperFirst(model.modelName);
    return {
        Mutation: {
            [`save${name}`]: (context, args) => model.upsert(args.obj),
            [`delete${name}`]: (context, args) => {
                return model.findById(args.id)
                    .then(instance => instance.destroy());
            }
        }
    };
}

/**
 * Generate resolvers for all models
 *
 * @param {Object} models: All loopback Models
 * @returns {Object} resolvers functions for base and all models - queries and mutations
 */
module.exports = function Resolvers(models) {
    let resolvers = _.reduce(models, (obj, model) => {
        if (model.shared) {
            return _.merge(
                obj,
                queryResolvers(model),
                relationsResolvers(model),
                mutationResolvers(model)
            );
        }
        return {};
    }, base.baseResolvers);
    return resolvers;
};