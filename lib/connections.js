'use strict';

var _ = require('lodash');

const PREFIX = 'connection.';

function base64(i) {
    return (new Buffer(i, 'ascii')).toString('base64');
}

function unbase64(i) {
    return (new Buffer(i, 'base64')).toString('ascii');
}

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

//to avoid eslint issues
function dummy(id) {
    id = 1;
    return cursorToId(id) + idToCursor(id);
}

function edgeTypeName(model) {
    return `${_.capitalize(model.pluralModelName)}Edge`;
}

function connectionType(model) {
    return `
        type ${model.modelName}Connections {
        pageInfo: PageInfo!
        edges: [${edgeTypeName(model)}]
        totalCount: Int
        ${model.pluralModelName}: [${model.modelName}]
        }`;
}

function edgeType(model) {
    return `
        type ${edgeTypeName(model)} {
        node: ${model.modelName}
        cursor: String!
    }`;
}

module.exports = {
    connectionType,
    edgeType,
    dummy
};