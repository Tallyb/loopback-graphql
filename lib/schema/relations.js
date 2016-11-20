'use strict';

var _ = require('lodash');

var utils = require('./utils');
var execution = require('./execution');

function isSimple(rel) {
    return rel.embed || !rel.multiple;
}

function typeDefs(model) {
    return _.reduce(utils.sharedRelations(model), (obj, rel, key) => {
        obj = obj + ' \n ' + (isSimple(rel) ?
            `${rel.name}: ${rel.modelTo.modelName}` :
            `${rel.name} ${utils.PAGINATION}: ${utils.connectionTypeName(rel.modelTo)}`);
        return obj;
    }, '');
}

function resolvers(model) {
    let resolver = {};
    _.forEach(utils.sharedRelations(model), rel => {
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