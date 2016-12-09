'use strict';
const _ = require('lodash');
const utils = require('./utils');

function buildSelector(model, args) {
    let selector = {
        where: args.where || {}
    };
    const begin = utils.getId(args.after);
    const end = utils.getId(args.before);

    selector.skip = args.first - args.last || 0;
    selector.limit = args.last || args.first;
    selector.order = model.getIdName() + (end ? ' DESC' : ' ASC');
    if (begin) {
        selector.where[model.getIdName()] = selector[model.getIdName()] || {};
        selector.where[model.getIdName()].gt = begin;
    }
    if (end) {
        selector.where[model.getIdName()] = selector[model.getIdName()] || {};
        selector.where[model.getIdName()].lt = end;
    }
    return selector;
}

function findOne(model, obj, args, context) {
    let id = obj ? obj[model.getIdName()] : args.id;
    return model.findById(id);
}

function getCount(model, obj, args, context) {
    return model.count(args.where);
}

function getFirst(model, obj, args) {
    return model.findOne({
            order: model.getIdName() + (args.before ? ' DESC' : ' ASC'),
            where: args.where
        })
        .then(res => {
            return res ? res.__data : {};
        });
}

function getList(model, obj, args) {
    return model.find(buildSelector(model, args));
}

function findAll(model, obj, args, context) {
    const response = {
        args: args
    };
    return getCount(model, obj, args)
        .then(count => {
            response.count = count;
            return getFirst(model, obj, args);
        })
        .then(first => {
            response.first = first;
            return getList(model, obj, args);
        })
        .then(list => {
            response.list = list;
            return response;
        });
}

function findRelated(rel, obj, args, context) {
    if (_.isArray(obj[rel.keyFrom])) {
        return [];
    }
    args.where = {
        [rel.keyTo]: obj[rel.keyFrom]
    };
    return findAll(rel.modelTo, obj, args, context);

}

function resolveConnection(model, obj, args, context) {
    return {
        [utils.connectionTypeName(model)]: {
            totalCount: (obj, args, context) => {
                return obj.count;
            },

            edges: (obj, args, context) => {
                return _.map(obj.list, node => {
                    return {
                        cursor: utils.idToCursor(node[model.getIdName()]),
                        node: node
                    };
                });
            },

            [model.pluralModelName]: (obj, args, context) => {
                return obj.list;
            },

            pageInfo: (obj, args, context) => {
                let pageInfo = {
                    startCursor: null,
                    endCursor: null,
                    hasPreviousPage: false,
                    hasNextPage: false
                };
                if (obj.count > 0) {
                    pageInfo.startCursor = utils.idToCursor(obj.list[0][model.getIdName()]);
                    pageInfo.endCursor = utils.idToCursor(obj.list[obj.list.length - 1][model.getIdName()]);
                    pageInfo.hasNextPage = obj.list.length === obj.args.limit;
                    pageInfo.hasPreviousPage = obj.list[0][model.getIdName()] !== obj.first[model.getIdName()].toString();
                }
                return pageInfo;
            }
        }
    };
}

module.exports = {
    findAll,
    findOne,
    findRelated,
    resolveConnection
};
