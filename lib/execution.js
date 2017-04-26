"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var utils = require("./utils.js");
function buildSelector(model, args) {
    var selector = {
        where: args.where || {},
    };
    var begin = utils.getId(args.after);
    var end = utils.getId(args.before);
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
    var id = obj ? obj[model.getIdName()] : args.id;
    return model.findById(id);
}
function getCount(model, obj, args, context) {
    return model.count(args.where);
}
function getFirst(model, obj, args) {
    return model.findOne({
        order: model.getIdName() + (args.before ? ' DESC' : ' ASC'),
        where: args.where,
    })
        .then(function (res) {
        return res ? res.__data : {};
    });
}
function getList(model, obj, args) {
    return model.find(buildSelector(model, args));
}
function findAll(model, obj, args, context) {
    var response = {
        args: args,
    };
    return getCount(model, obj, args)
        .then(function (count) {
        response.count = count;
        return getFirst(model, obj, args);
    })
        .then(function (first) {
        response.first = first;
        return getList(model, obj, args);
    })
        .then(function (list) {
        response.list = list;
        return response;
    });
}
function findRelated(rel, obj, args, context) {
    if (_.isArray(obj[rel.keyFrom])) {
        return [];
    }
    args.where = (_a = {},
        _a[rel.keyTo] = obj[rel.keyFrom],
        _a);
    return findAll(rel.modelTo, obj, args, context);
    var _a;
}
function resolveConnection(model, obj, args, context) {
    return _a = {},
        _a[utils.connectionTypeName(model)] = (_b = {
                totalCount: function (obj, args, context) {
                    return obj.count;
                },
                edges: function (obj, args, context) {
                    return _.map(obj.list, function (node) {
                        return {
                            cursor: utils.idToCursor(node[model.getIdName()]),
                            node: node,
                        };
                    });
                }
            },
            _b[model.pluralModelName] = function (obj, args, context) {
                return obj.list;
            },
            _b.pageInfo = function (obj, args, context) {
                var pageInfo = {
                    startCursor: null,
                    endCursor: null,
                    hasPreviousPage: false,
                    hasNextPage: false,
                };
                if (obj.count > 0) {
                    pageInfo.startCursor = utils.idToCursor(obj.list[0][model.getIdName()]);
                    pageInfo.endCursor = utils.idToCursor(obj.list[obj.list.length - 1][model.getIdName()]);
                    pageInfo.hasNextPage = obj.list.length === obj.args.limit;
                    pageInfo.hasPreviousPage = obj.list[0][model.getIdName()] !== obj.first[model.getIdName()].toString();
                }
                return pageInfo;
            },
            _b),
        _a;
    var _a, _b;
}
exports.default = {
    findAll: findAll,
    findOne: findOne,
    findRelated: findRelated,
    resolveConnection: resolveConnection,
};
//# sourceMappingURL=execution.js.map