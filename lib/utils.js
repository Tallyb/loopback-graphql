'use strict';

var _ = require('lodash');

const SCALARS = {
    number: 'Float',
    string: 'String',
    boolean: 'Boolean',
    objectid: 'ID',
    date: 'Date',
    object: 'JSON'
};

const PAGINATION = '(where: JSON, after: String, first: Int, before: String, last: Int)';

function toType(type) {
    let scalar = SCALARS[type.toLowerCase().trim()];
    return scalar ? scalar : type;
}

function base64(i) {
    return (new Buffer(i, 'ascii')).toString('base64');
}

function unbase64(i) {
    return (new Buffer(i, 'base64')).toString('ascii');
}

const PREFIX = 'connection.';

/**
 * Creates the cursor string from an offset.
 * @param {String} id the id to convert
 * @returns {String}   an opaque cursor
 */
function idToCursor(id) {
    return base64(PREFIX + id);
}

/**
 * Rederives the offset from the cursor string.
 * @param {String} cursor   the cursor for conversion
 * @returns {String} id   converted id
 */
function cursorToId(cursor) {
    return unbase64(cursor).substring(PREFIX.length);
}

function getId(cursor) {
    if (cursor === undefined || cursor === null) {
        return null;
    }
    return cursorToId(cursor);
}

/**
 * Filter models to return shared models only
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
 * @param {Object} model A single loopback model
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
    PAGINATION,
    getId,
    idToCursor,
    cursorToId
};