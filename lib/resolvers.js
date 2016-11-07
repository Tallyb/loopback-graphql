'use strict';

var _ = require('lodash');
var gqlLang = require('graphql/language');
var helper = require('./helper');

function parseJSONLiteral(ast) {
    switch (ast.kind) {
        case gqlLang.Kind.STRING:
        case gqlLang.Kind.BOOLEAN:
            return ast.value;
        case gqlLang.Kind.INT:
        case gqlLang.Kind.FLOAT:
            return parseFloat(ast.value);
        case gqlLang.Kind.OBJECT:
            {
                const value = Object.create(null);
                ast.fields.forEach(field => {
                    value[field.name.value] = parseJSONLiteral(field.value);
                });

                return value;
            }
        case gqlLang.Kind.LIST:
            return ast.values.map(parseJSONLiteral);
        default:
            return null;
    }
}

const typeResolvers = {
    Date: {
        __parseValue(value) {
            return new Date(value); // value from the client
        },
        __serialize(value) {
            return value.getTime(); // value sent to the client
        },
        __parseLiteral(ast) {
            if (ast.kind === gqlLang.Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        }
    },
    JSON: {
        __parseLiteral: parseJSONLiteral,
        __serialize: value => value,
        __parseValue: value => value
    }

};

function rootResolvers(models) {
    let resolvers = {};
    //plural models (with pagination)
    _.forEach(helper.sharedModels(models), m => {
        resolvers[m.pluralModelName] = (obj, args, context) => {
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

function modelResolvers(models) {
    let resolvers = {};
    _.forEach(helper.sharedModels(models), model => {
        resolvers[model.modelName] = (obj, args, context) => {
            return model.findById(obj.id);
        };
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
        resolvers[model.modelName] = resolver;
    });
    return resolvers;
}

function saveResolvers(models) {
    let resolvers = {};
    _.forEach(helper.sharedModels(models), model => {
        resolvers[`save${_.capitalize(model.modelName)}`] = (context, args) => {
            return model.upsert(args.obj);
        };
    });
    return resolvers;
}

function deleteResolvers(models) {
    let resolvers = {};
    _.forEach(helper.sharedModels(models), model => {
        resolvers[`delete${_.capitalize(model.modelName)}`] = (context, args) => {
            return model.findById(args.id)
                .then(instance => {
                    return instance.destroy();
                });
        };
    });
    return resolvers;
}

/**
 * Generate resolvers for all modesl
 *
 * @param {Object} models: All loopback Models
 * @returns {Object} resolvers functions for all models - queries and mutations
 */
module.exports = function Resolvers(models) {
    return _.merge(
        typeResolvers,
        rootResolvers(models),
        modelResolvers(models), {
            Mutation: _.merge(
                saveResolvers(models),
                deleteResolvers(models)
            )
        }
    );
};