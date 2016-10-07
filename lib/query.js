'use strict';

var _ = require('lodash');
var helper = require('./helper');

const pagination = '(first: Int, after: Int)';

function generateEnums(models) {
    return _.map(models, m => {
        return helper.mapEnums(m);
    }).join('\n ');
}

const mapModel = (model) => {

    let props = helper.mapProps(model);

    let rels = _.map(model.relations, (r, key) => {
        let i = r.multiple ? `${r.name} ${pagination}: [${r.modelTo.modelName}]` : `${r.name}: ${r.modelTo.modelName}`;
        return i;
    }).join('\n ');

    return `type ${model.modelName} {
         ${props}
         ${rels}    
        }`;
};

function generateTypeDefs(models) {
    return _.map(models, m => {
        return mapModel(m);
    }).join('\n');
}

function generateQueries(models) {
    return _.map(models, m => {
        return `
            ${m.pluralModelName} ${pagination}: [${m.modelName}]
            ${m.modelName}: ${m.modelName}
        `;
    }).join('\n');
}

module.exports = {
    generateEnums,
    generateQueries,
    generateTypeDefs
};
