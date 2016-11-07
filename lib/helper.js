'use strict';

var _ = require('lodash');
//var debug = require('debug')('helpers');

const SCALARS = {
    number: 'Float',
    string: 'String',
    boolean: 'Boolean',
    objectid: 'ID',
    date: 'Date',
    object: 'JSON'
};

const PAGINATION = '(after: String, first: Int, before: String, after: Int)';

function toType(type) {
    let scalar = SCALARS[type.toLowerCase().trim()];
    return scalar ? scalar : type;
}

/**
 * Filter models to return shared models only
 *
 * @param {Array<Model>} models all Loopback Models
 * @returns {Array<Model>} list of shared models
 */

function sharedModels(models) {
    return _.filter(models, model => {
        return model.shared;
    });
}

/**
 * Filter model's relationships to return shared relationships only
 *
 * @param {OBject} model A single loopback model
 * @returns {Array<Model>} list of shared relationships
 */
function sharedRelations(model) {
    return _.pickBy(model.relations, r => {
        return r.modelTo.shared;
    });
}

module.exports = {
    toType,
    sharedModels,
    sharedRelations,
    PAGINATION
};