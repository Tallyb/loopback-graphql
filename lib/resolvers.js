'use strict';

var _ = require('lodash');

//var utils = require('./utils');
var base = require('./base');
var query = require('./query');
var mutation = require('./mutation');
var connections = require('./connections');
var relations = require('./relations');

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
                query.resolvers(model),
                mutation.resolvers(model),
                connections.resolver(model),
                relations.resolvers(model)
            );
        }
        return obj;
    }, base.resolvers);
};