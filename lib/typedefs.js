'use strict';

var _ = require('lodash');
var helper = require('./helper');

const pagination = '(first: Int, after: Int)';

function generateEnums(models) {
    return _.map(models, model => {
        return helper.mapEnums(model);
    }).join(' \n ');
}

function mapModel(model) {
    let rels = _.map(helper.validRelations(model), (r, key) => {
        return r.multiple ? `${r.name} ${pagination}: [${r.modelTo.modelName}]` : `${r.name}: ${r.modelTo.modelName}`;
    }).join('\n ');

    return `type ${model.modelName} {
         ${helper.propsTypes(model)}
         ${rels}    
    }`;
}

function generateTypes(models) {
    return _.map(models, model => {
        return mapModel(model);
    }).join('\n');
}

function generateSingleQueries(models) {
    return _.map(models, model => {
        return `
            ${model.modelName} (id: ID!): ${model.modelName}
        `;
    }).join('\n');
}

function generatePluralQueries(models) {
    return _.map(models, model => {
        return `
            ${model.pluralModelName} ${pagination}: [${model.modelName}]
        `;
    }).join('\n');
}


function generateInputs(models) {
    return _.map(models, m => {
        return `
        input ${m.modelName}Input {
            ${helper.propsTypes(m)}
        } 
        `;
    }).join('\n');
}

function generateSaves(models) {
    return _.map(models, m => {
        return `
            save${_.capitalize(m.modelName)} (obj: ${m.modelName}Input!) : ${m.modelName}
        `;
    }).join('\n');
}

function generateDeletes(models) {
    return _.map(models, m => {
        return `
            delete${_.capitalize(m.modelName)} (id: ID!) : String
        `;
    }).join('\n');
}

function generateTypeDefs(models) {
    return [
        'scalar Date',
        generateEnums(models),
        generateTypes(models),
        generateInputs(models),
        `type Query { 
            ${generatePluralQueries(models)} 
            ${generateSingleQueries(models)}
        }`,
        `type Mutation { 
            ${generateSaves(models)}
            ${generateDeletes(models)}    
         }`,
        `schema {
                query: Query
                mutation: Mutation
        }`
    ];
}

module.exports = {
    generateTypeDefs
};
