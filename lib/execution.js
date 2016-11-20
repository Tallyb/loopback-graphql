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
    if (rel.multiple) {
        // single relationship or set of items with ids included
        args.where = {
            [rel.keyTo]: obj[rel.keyFrom]
        };
        return findAll(rel.modelTo, obj, args, context);
        //rel.modelTo.findByIds(obj[rel.keyFrom]);
    } else {

        return findOne(rel.modelTo, obj, args, context);
        //selector.where[rel.keyTo] = obj[rel.keyFrom];
        //return rel.modelTo.find(selector);
    }
}

module.exports = {
    findAll,
    findOne,
    findRelated
};