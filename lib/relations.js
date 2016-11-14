'use strict';

var _ = require('lodash');

var utils = require('./utils');
var connections = require('./connections');
var execution = require('./execution');

function isSimple(rel) {
    return rel.embed || !rel.multiple;
}

function sharedRelations(model) {
    return _.pickBy(model.relations, rel => rel.modelTo.shared);
}

function typeDefs(model) {
    return _.reduce(sharedRelations(model), (obj, rel, key) => {
        obj = obj + ' \n ' + (isSimple(rel) ?
            `${rel.name}: ${rel.modelTo.modelName}` :
            `${rel.name} ${utils.PAGINATION}: ${connections.connectionTypeName(rel.modelTo)}`);
        return obj;
    }, '');
}

function resolvers(model) {
    let resolver = {};
    _.forEach(sharedRelations(model), rel => {
        resolver[rel.name] = (obj, args, context) => {
            return execution.findRelated(rel, obj, args, context);
        };
    });

    return {
        [model.modelName]: resolver
    };
}

module.exports = {
    typeDefs,
    resolvers
};