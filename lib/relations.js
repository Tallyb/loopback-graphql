'use strict';

var _ = require('lodash');

var utils = require('./utils');
var connections = require('./connections');
var execution = require('./execution');

function isSimple(rel) {
    return rel.embed || !rel.multiple;
}

function isShared(rel) {
    return rel.modelTo.shared;
}

function typeDefs(model) {
    return _.reduce(model.relations, (obj, rel, key) => {
        if (isShared(rel)) {
            obj = obj + ' \n ' + (isSimple(rel) ?
                `${rel.name}: ${rel.modelTo.modelName}` :
                `${rel.name} ${utils.PAGINATION}: [${connections.connectionTypeName(rel.modelTo)}]`);
        }
        return obj;
    }, '');
}

function resolvers(model) {
    let resolver = {};
    _.forEach(model.relations, rel => {
        if (isShared(rel)) {
            if (isSimple(rel)) {
                resolver[rel.name] = (obj, args, context) => {
                    return execution.findEmbedded(rel, obj, args, context);
                };
            } else {
                resolver[rel.name] = (obj, args, context) => {
                    return execution.findRelated(rel, obj, args, context);
                };
            }
        }
    });

    return {
        [model.modelName]: resolver
    };
}

module.exports = {
    typeDefs,
    resolvers
};