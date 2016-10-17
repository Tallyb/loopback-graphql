'use strict';

var _ = require('lodash');
//var debug = require('debug')('helpers');

const SCALARS = {
    Number: 'Float',
    String: 'String',
    Boolean: 'Boolean',
    ObjectID: 'ID',
    Date: 'Date'
};

function sharedModels(models) {
    return _.filter(models, model => {
        return model.shared;
    });
}

function sharedRelations(model) {
    return _.pickBy(model.relations, r => {
        return r.modelTo.shared;
    });
}

module.exports = {
    SCALARS,
    sharedModels,
    sharedRelations
};