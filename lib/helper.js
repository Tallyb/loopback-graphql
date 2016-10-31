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

function toType(type) {
    return SCALARS[type.toLowerCase()];
}

function validProps(model) {
    return _.pickBy(model.definition.properties, (prop, key) => {
        let valid = true;
        if (model.defintion.settings.hidden) {
            valid = valid && model.definition.settings.hidden.indexOf(key) === -1;
        }
        return model.defintion.settings.hidden &&
            model.definition.settings.hidden.indexOf(key) === -1 &&
            !prop.deprecated;
    });
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
    validProps,
    sharedModels,
    sharedRelations
};