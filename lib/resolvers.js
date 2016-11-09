'use strict';

var _ = require('lodash');

var helper = require('./helper');
var base = require('./base');
var connections = require('./connections');

function rootResolvers(models) {
    let resolvers = {};
    //plural models (with connections pagination)
    _.forEach(helper.sharedModels(models), model => {
        resolvers[`all${_.upperFirst(model.pluralModelName)}`] = (obj, args, context) => {
            return connections.find(model, obj, args, context);
        };
    });
    //single models (with id)
    _.forEach(helper.sharedModels(models), m => {
        resolvers[m.modelName] = (obj, args, context) => {
            return m.findById(args.id).then(res => {
                return res;
            });
        };
    });
    return {
        Query: resolvers
    };
}

function generateResolver(model) {
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

function modelResolvers(models) {
    let resolvers = {};
    _.forEach(helper.sharedModels(models), model => {
        resolvers[model.modelName] = (obj, args, context) => {
            return model.findById(obj.id);
        };
        resolvers[model.modelName] = generateResolver(model);
    });
    return resolvers;
}

function saveResolvers(models) {
    let resolvers = {};
    _.forEach(helper.sharedModels(models), model => {
        resolvers[`save${_.upperFirst(model.modelName)}`] = (context, args) => model.upsert(args.obj);
    });
    return resolvers;
}

function deleteResolvers(models) {
    let resolvers = {};
    _.forEach(helper.sharedModels(models), model => {
        resolvers[`delete${_.upperFirst(model.modelName)}`] = (context, args) => {
            return model.findById(args.id)
                .then(instance => instance.destroy());
        };
    });
    return resolvers;
}

/**
 * Generate resolvers for all models
 *
 * @param {Object} models: All loopback Models
 * @returns {Object} resolvers functions for base and all models - queries and mutations
 */
module.exports = function Resolvers(models) {
    return _.merge(
        base.baseResolvers,
        rootResolvers(models),
        modelResolvers(models), {
            Mutation: _.merge(
                saveResolvers(models),
                deleteResolvers(models)
            )
        }
    );
};