'use strict';

var _ = require('lodash');
//var debug = require('debug')('helpers');

const SCALARS = {
    Number: 'Float',
    number: 'Float',
    String: 'String',
    string: 'String',
    Boolean: 'Boolean',
    boolean: 'Boolean',
    ObjectID: 'ID',
    Date: 'Date',
    object: 'JSON'
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