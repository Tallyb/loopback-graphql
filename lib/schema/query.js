'use strict';
var _ = require('lodash');
var utils = require('./utils');
var execution = require('./execution');

function resolvers(model) {
    return {
        Query: {
            [`${utils.pluralModelName(model)}`]: (root, args, context) => {
                return execution.findAll(model, root, args, context);
            },
            [`${utils.singularModelName(model)}`]: (obj, args, context) => {
                return execution.findOne(model, obj, args, context);
            }
        }
    };
}

module.exports = {
    resolvers
};