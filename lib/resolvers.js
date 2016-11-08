'use strict';

var _ = require('lodash');

var helper = require('./helper');
var base = require('./base');

function rootResolvers(models) {
    let resolvers = {};
    //plural models (with pagination)
    _.forEach(helper.sharedModels(models), m => {
        resolvers[`all${_.upperFirst(m.pluralModelName)}`] = (obj, args, context) => {
            return m.find({
                skip: args.after,
                limit: args.first
            }).then(res => {
                return res;
            });
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
    _.forEach(model.relations, r => {
        if (r.modelTo.shared) {
            resolver[r.name] = (obj, args, context) => {
                if (r.multiple) {
                    if (_.isArray(obj[r.keyFrom])) {
                        return r.modelTo.findByIds(obj[r.keyFrom]);
                    } else {
                        let query = {};
                        query[r.keyTo] = obj[r.keyFrom];
                        return r.modelTo.find({
                            where: query,
                            skip: args.after,
                            limit: args.first
                        });
                    }
                } else {
                    return r.modelTo.findById(obj[r.keyFrom]);
                }
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