"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var PAGINATION = '(where: JSON, after: String, first: Int, before: String, last: Int)';
exports.PAGINATION = PAGINATION;
function base64(i) {
    return (new Buffer(i, 'ascii')).toString('base64');
}
function unbase64(i) {
    return (new Buffer(i, 'base64')).toString('ascii');
}
var PREFIX = 'connection.';
function idToCursor(id) {
    return base64(PREFIX + id);
}
exports.idToCursor = idToCursor;
function cursorToId(cursor) {
    return unbase64(cursor).substring(PREFIX.length);
}
exports.cursorToId = cursorToId;
function getId(cursor) {
    if (cursor === undefined || cursor === null) {
        return null;
    }
    return cursorToId(cursor);
}
exports.getId = getId;
function connectionTypeName(model) {
    return model.modelName + "Connection";
}
exports.connectionTypeName = connectionTypeName;
function edgeTypeName(model) {
    return model.modelName + "Edge";
}
exports.edgeTypeName = edgeTypeName;
function singularModelName(model) {
    return model.modelName;
}
exports.singularModelName = singularModelName;
function pluralModelName(model) {
    return 'all' + _.upperFirst(model.pluralModelName);
}
exports.pluralModelName = pluralModelName;
function sharedRelations(model) {
    return _.pickBy(model.relations, function (rel) { return rel.modelTo && rel.modelTo.shared; });
}
exports.sharedRelations = sharedRelations;
function sharedModels(models) {
    return _.filter(models, function (model) {
        return model.shared;
    });
}
exports.sharedModels = sharedModels;
function methodName(method, model) {
    return model.modelName + _.upperFirst(method.name);
}
exports.methodName = methodName;
//# sourceMappingURL=utils.js.map