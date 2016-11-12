'use strict';

var _ = require('lodash');
var utils = require('./utils');

function emptyConnection(modelName) {
    return {
        [modelName]: [],
        totalCount: 0,
        edges: [],
        pageInfo: {
            startCursor: null,
            endCursor: null,
            hasPreviousPage: false,
            hasNextPage: false
        }
    };
}

function connectionType(model) {
    return `
        type ${utils.connectionTypeName(model)} {
        pageInfo: PageInfo!
        edges: [${utils.edgeTypeName(model)}]
        totalCount: Int
        ${model.pluralModelName}: [${model.modelName}]
        }`;
}

function edgeType(model) {
    return `
        type ${utils.edgeTypeName(model)} {
        node: ${model.modelName}
        cursor: String!
    }`;
}

function findAll(model, root, args, context) {
    let idName = model.getIdName();
    let connection = emptyConnection(model.pluralModelName);
    let selector;
    let firstElement;

    selector = {
        where: {}
    };
    const begin = utils.getId(args.after);
    const end = utils.getId(args.before);

    return model.count()
        .then(res => {
            connection.totalCount = res;
            return res;
        })
        .then(res => {
            selector.order = idName + (end ? ' DESC' : ' ASC');
            return model.findOne(_.cloneDeep(selector));
        })
        .then(res => {
            firstElement = res.__data;
            return res;
        }).then(() => {
            if (connection.totalCount > 0) {

                selector.skip = args.first - args.last || 0;
                selector.limit = args.last || args.first;

                if (begin) {
                    selector.where[idName] = selector[idName] || {};
                    selector.where[idName].gt = begin;
                }

                if (end) {
                    selector.where[idName] = selector[idName] || {};
                    selector.where[idName].lt = end;
                }
                return model.find(selector);
            } else {
                return [];
            }
        }).then(res => {
            if (res.length > 0) {
                connection[model.pluralModelName] = res;
                connection.edges = _.map(res, node => {
                    return {
                        cursor: utils.idToCursor(node[idName]),
                        node: node
                    };
                });
                connection.pageInfo = {
                    startCursor: connection.edges[0].cursor,
                    endCursor: connection.edges[connection.edges.length - 1].cursor,
                    hasNextPage: res.length === selector.limit,
                    hasPreviousPage: utils.cursorToId(connection.edges[0].cursor) !== firstElement[idName].toString()
                };
            }
            return connection;
        });
}

function relationQuery(obj, rel, args) {
    return {
        [rel.keyTo]: obj[rel.keyFrom]
    };
}

function findRelation(rel, obj, args, context) {
    if (rel.multiple) {
        if (_.isArray(obj[rel.keyFrom])) {
            return rel.modelTo.findByIds(obj[rel.keyFrom]);
        } else {
            return rel.modelTo.find({
                where: relationQuery(obj, rel, args),
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
    findAll,
    findRelation
};