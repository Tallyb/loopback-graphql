'use strict';

var _ = require('lodash');
var utils = require('./helper');

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
    let connection = emptyConnection(model.pluralModelName);
    let selector = {};
    //let firstElement;

    return model.count()
        .then(res => {
            connection.totalCount = res;
            return res;
        })
        .then(() => {
            return model.findOne({
                order: '_id DESC'
            });
        })
        .then(res => {
            //firstElement = res;
            return res;
        }).then(() => {
            if (connection.totalCount > 0) {

                const begin = utils.getId(args.after);
                const end = utils.getId(args.before);

                selector.offset = args.first - args.last || 0;
                selector.limit = args.last || args.first;
                selector.order = begin ? '_id ASC' : '_id DESC';

                if (begin) {
                    selector._id = selector._id || {};
                    selector._id.$gt = begin;
                }

                if (end) {
                    selector._id = selector._id || {};
                    selector._id.$lt = end;
                }
                console.log('selector', selector);
                return model.find(selector);
            } else {
                return [];
            }
        }).then(res => {
            connection[model.pluralModelName] = res;
            connection.edges = _.map(res, node => {
                return {
                    cursor: utils.idToCursor(node._id),
                    node: node
                };
            });
            // connection.pageInfo = {
            //     startCursor: connection.edges[0].cursor,
            //     endCursor: connection.edges[connection.edges.length - 1].cursor,
            //     hasNextPage: res.length === selector.limit,
            //     hasPreviousPage: utils.cursorToId(connection.edges[0].cursor) !== firstElement._id.toString()
            // };
            return connection;
        });
}

function findRelation(rel, obj, args, context) {
    if (rel.multiple) {
        if (_.isArray(obj[rel.keyFrom])) {
            return rel.modelTo.findByIds(obj[rel.keyFrom]);
        } else {
            return rel.modelTo.find({
                where: utils.relationQueryBuilder(obj, rel, args),
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
    findRelation
};