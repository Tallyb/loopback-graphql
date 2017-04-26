"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var PAGINATION = '(where: JSON, after: String, first: Int, before: String, last: Int)';
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
function cursorToId(cursor) {
    return unbase64(cursor).substring(PREFIX.length);
}
function getId(cursor) {
    if (cursor === undefined || cursor === null) {
        return null;
    }
    return cursorToId(cursor);
}
function connectionTypeName(model) {
    return model.modelName + "Connection";
}
function edgeTypeName(model) {
    return model.modelName + "Edge";
}
function singularModelName(model) {
    return model.modelName;
}
function pluralModelName(model) {
    return 'all' + _.upperFirst(model.pluralModelName);
}
function sharedRelations(model) {
    return _.pickBy(model.relations, function (rel) { return rel.modelTo && rel.modelTo.shared; });
}
function sharedModels(models) {
    return _.filter(models, function (model) {
        return model.shared;
    });
}
function methodName(method, model) {
    return model.modelName + _.upperFirst(method.name);
}
exports.default = {
    PAGINATION: PAGINATION,
    getId: getId,
    idToCursor: idToCursor,
    cursorToId: cursorToId,
    connectionTypeName: connectionTypeName,
    edgeTypeName: edgeTypeName,
    singularModelName: singularModelName,
    methodName: methodName,
    pluralModelName: pluralModelName,
    sharedRelations: sharedRelations,
    sharedModels: sharedModels,
};
//# sourceMappingURL=utils.js.map