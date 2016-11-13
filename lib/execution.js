'use strict';
var _ = require('lodash');
var utils = require('./utils');

function buildSelector(model, args) {
    let selector = {
        where: {}
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
    let id = obj ? obj.id : args.id;
    return model.findById(id);
}

function getCount(model, obj, args, context) {
    return model.count();
}

function getFirst(model, obj, args) {
    return model.findOne({
            order: model.getIdName() + (args.before ? ' DESC' : ' ASC')
        })
        .then(res => {
            return res.__data;
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
    let selector = {};
    if (!rel.multiple || _.isArray(obj[rel.keyFrom])) {
        // single relationship or set of items with ids included
        return rel.modelTo.findByIds(obj[rel.keyFrom]);
    } else {
        selector.where[rel.keyTo] = obj[rel.keyFrom];
        return rel.modelTo.find(selector);
    }
}

module.exports = {
    findAll,
    findOne,
    findRelated
};