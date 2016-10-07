'use strict';

var _ = require('lodash');
var helper = require('./helper');

const pagination = '(first: Int, after: Int)';

function generateEnums(models) {
    return _.map(models, model => {
        return helper.mapEnums(model);
    }).join(' \n ');
}

const mapModel = (model) => {

    let rels = _.map(helper.validRelations(model), (r, key) => {
        return r.multiple ? `${r.name} ${pagination}: [${r.modelTo.modelName}]` : `${r.name}: ${r.modelTo.modelName}`;
    }).join('\n ');

    return `type ${model.modelName} {
         ${helper.propsTypes(model)}
         ${rels}    
    }`;
};

function generateTypeDefs(models) {
    return _.map(models, model => {
        return mapModel(model);
    }).join('\n');
}

function generateQueries(models) {
    return _.map(models, model => {
        return `
            ${model.pluralModelName} ${pagination}: [${model.modelName}]
            ${model.modelName}: ${model.modelName}
        `;
    }).join('\n');
}

module.exports = {
    generateEnums,
    generateQueries,
    generateTypeDefs
};
