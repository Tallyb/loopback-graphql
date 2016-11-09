'use strict';

var _ = require('lodash');
//var Promise = require('bluebird');

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

function emptyConnection(modelName) {
    return {
        [modelName]: [],
        count: 0,
        edges: [],
        pageInfo: {
            startCursor: null,
            endCursor: null,
            hasPreviousPage: false,
            hasNextPage: false
        }
    };
}

//to avoid eslint issues
function dummy(id) {
    id = 1;
    return cursorToId(id) + idToCursor(id);
}

function edgeTypeName(model) {
    return `${model.pluralModelName}Edge`;
}

function connectionTypeName(model) {
    return `${_.upperFirst(model.modelName)}Connection`;
}

function connectionType(model) {
    return `
        type ${connectionTypeName(model)} {
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

function findAll(model, root, args, context) {
    let connection = emptyConnection(model.modelName);
    return model.count()
        .then(res => {
            connection.count = res;
            return res;
        })
        .then(res => {
            if (res > 0) {
                return model.find({
                    skip: args.after,
                    limit: args.first
                });
            } else {
                return [];
            }
        }).then(res => {
            connection[model.modelName] = res;
            return connection;
        });
}

function findRelation(rel, obj, args, context) {
    if (rel.multiple) {
        if (_.isArray(obj[rel.keyFrom])) {
            return rel.modelTo.findByIds(obj[rel.keyFrom]);
        } else {
            let query = {};
            query[rel.keyTo] = obj[rel.keyFrom];
            return rel.modelTo.find({
                where: query,
                skip: args.after,
                limit: args.first
            });
        }
    } else {
        return rel.modelTo.findById(obj[rel.keyFrom]);
    }
}

module.exports = {
    connectionType,
    edgeType,
    connectionTypeName,
    edgeTypeName,
    findAll,
    findRelation,
    dummy
};