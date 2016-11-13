'use strict';
var _ = require('lodash');
var utils = require('./utils');
var connections = require('./connections');
var execution = require('./execution');

function pluralModelName(model) {
    return 'all' + _.upperFirst(model.pluralModelName);
}

function singularModelName(model) {
    return model.modelName;
}

function typeDefs(model) {
    return `
        ${singularModelName(model)} (id: ID!): ${model.modelName} 
        ${pluralModelName(model)} ${utils.PAGINATION}: ${connections.connectionTypeName(model)}
    `;
}

function resolvers(model) {
    return {
        Query: {
            [`${pluralModelName(model)}`]: (root, args, context) => {
                return execution.findAll(model, root, args, context);
            },
            [`${singularModelName(model)}`]: (obj, args, context) => {
                return execution.findOne(model, obj, args, context);
            }
        }
    };
}

module.exports = {
    typeDefs,
    resolvers
};