'use strict';

var _ = require('lodash');
var gqlLang = require('graphql/language');

var helper = require('./helper');

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
    }
};

function generateRootResolvers(models) {
    let resolvers = {};
    _.forEach(models, m => {
        resolvers[m.pluralModelName] = (obj, args, context) => {
            return m.find({ skip: args.after, limit: args.first }).then(res => {
                return res;
            });
        };
    });
    _.forEach(models, m => {
        resolvers[m.modelName] = (obj, args, context) => {
            return m.findById(args.id).then(res => {
                return res;
            });
        };
    });
    return { Query: resolvers };
}

function generateModelResolvers(models) {
    let resolvers = {};
    _.forEach(models, m => {
        resolvers[m.modelName] = (obj, args, context) => {
            return m.findById(obj.id);
        };
        let resolver = {};
        _.forEach(helper.validRelations(m), r => {
            resolver[r.name] = (obj, args, context) => {
                if (r.multiple) {
                    let query = {};
                    query[r.keyTo] = obj[r.keyFrom];
                    return r.modelTo.find({ where: query, skip: args.after, limit: args.first });
                } else {
                    return r.modelTo.findById(obj[r.keyFrom]);
                }
            };
        });
        resolvers[m.modelName] = resolver;
    });
    return resolvers;
}

function generateSaveResolvers(models) {
    let resolvers = {};
    _.forEach(models, model => {
        resolvers[`save${_.capitalize(model.modelName)}`] = (context, args) => {
            return model.upsert(args.obj);
        };
    });
    return resolvers;
}

function generateDeleteResolvers(models) {
    let resolvers = {};
    _.forEach(models, model => {
        resolvers[`delete${_.capitalize(model.modelName)}`] = (context, args) => {
            return model.findById(args.id)
                .then(instance => {
                    return instance.destroy();
                });
        };
    });
    return resolvers;
}

function generateResolvers(models) {
    return _.merge(
        typeResolvers,
        generateRootResolvers(models),
        generateModelResolvers(models),
        {
            Mutation: _.merge(
                generateSaveResolvers(models),
                generateDeleteResolvers(models)
            )
        }
    );
}

module.exports = {
    generateResolvers
};