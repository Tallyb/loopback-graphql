'use strict';

var _ = require('lodash');
//var debug = require('debug')('typedefs');
var helper = require('./helper');

var generateModels = require('./models.js');
var base = require('./base');

function RootQueries(models) {
    return _.map(helper.sharedModels(models), model => {
        return `
            ${model.modelName} (id: ID!): ${model.modelName} 
            all${_.capitalize(model.pluralModelName)} ${helper.PAGINATION}: [${model.modelName}Connections]
            `;
    }).join(' ');
}

function Saves(models) {
    return _.map(helper.sharedModels(models), model => {
        return `
            save${_.capitalize(model.modelName)} (obj: ${model.modelName}Input!) : ${model.modelName}
        `;
    }).join(' ');
}

function Deletes(models) {
    return _.map(helper.sharedModels(models), model => {
        return `
            delete${_.capitalize(model.modelName)} (id: ID!) : String
        `;
    }).join('');
}

/**
 * Generates all typedef schema for the models
 *
 * @param {any} models: All Loopback models to be generated
 * @returns {string}:   graphql schema
 */
module.exports = function typeDefs(models) {
    return [
        base.baseTypes,
        generateModels(models),
        `type Query { 
            ${RootQueries(models)} 
            }`,
        `type Mutation { 
            ${Saves(models)}
            ${Deletes(models)}  
            }`,
        `schema {
            query: Query
            mutation: Mutation
        }`
    ];
};