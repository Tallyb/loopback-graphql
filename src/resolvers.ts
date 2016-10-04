'use strict';

import _ from 'lodash';
import { Kind } from 'graphql/language';

const typeResolvers = {
    Date: {
        __parseValue(value) {
            return new Date(value); // value from the client
        },
        __serialize(value) {
            return value.getTime(); // value sent to the client
        },
        __parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
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
            console.log('CONTEXT', context);
            console.log('ARGS', args);
            return m.find(args).then(res => {
                return res;
            });
        };
    });
    _.forEach(models, m => {
        resolvers[m.modelName] = (obj, args, context) => {
            console.log('CONTEXT', context);
            console.log('ARGS', args);
            return m.findOne(args).then(res => {
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
        _.forEach(m.relations, r => {
            resolver[r.name] = (obj, args, context) => {
                let query = {};
                query[r.keyTo] = obj[r.keyFrom];
                return r.modelTo.find({where: query}).then(res => {
                    return res;
                });
            };
        });
        resolvers[m.modelName] = resolver;
    });
    return resolvers;
}

function generateResolvers(models) {
    return _.merge(typeResolvers, generateRootResolvers(models), generateModelResolvers(models));
}

let modelResolvers = {
    generateResolvers
};

export default modelResolvers;