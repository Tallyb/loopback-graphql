'use strict';

var _ = require('lodash');
//var debug = require('debug')('typedefs');
var helper = require('./helper');

var generateModels = require('./models.js');

function generateRootQueries(models) {
    return _.map(helper.sharedModels(models), model => {
        return `
                ${model.modelName} (id: ID!): ${model.modelName} 
                ${model.pluralModelName} ${helper.PAGINATION}: [${model.modelName}]
            `;
    }).join(' ');
}

function generateSaves(models) {
    return _.map(helper.sharedModels(models), model => {
        return `
            save${_.capitalize(model.modelName)} (obj: ${model.modelName}Input!) : ${model.modelName}
        `;
    }).join(' ');
}

function generateDeletes(models) {
    return _.map(helper.sharedModels(models), model => {
        return `
            delete${_.capitalize(model.modelName)} (id: ID!) : String
        `;
    }).join('');
}

function generateAccepts(name, props) {
    return _.map(props, prop => {
        if (_.isArray(prop.type)) {
            return `${prop.arg}: [${helper.toType(prop.type[0])}]${prop.required ? '!' : ''}`;
        } else if (helper.toType(prop.type)) {
            return `${prop.arg}: ${helper.toType(prop.type)}${prop.required ? '!' : ''}`;
        } else {
            return '';
        }
    }).join(' ');
}

function generateReturns(name, prop) {
    if (_.isArray(prop.type)) {
        return `[${helper.toType(prop.type[0])}]${prop.required ? '!' : ''}`;
    } else if (helper.toType(prop.type)) {
        return `${helper.toType(prop.type)}${prop.required ? '!' : ''}`;
    } else {
        return '';
    }
}

function generateMethods(models) {
    return _.map(helper.sharedModels(models), model => {
        return _.chain(model.sharedClass.methods())
            .map(method => {
                if (method.accessType !== 'READ' &&
                    method.accessType !== 'WRITE' &&
                    method.http.path) {
                    return `${method.http.path.replace('/', '')} (
                        ${generateAccepts(method.name, method.accepts)}
                    ): ${generateReturns(method.name, method.returns)} `;
                } else {
                    return undefined;
                }
            })
            .compact()
            .value()
            .join(' ');
    }).join(' \n ');
}

/**
 * Generates all typedef schema for the models
 *
 * @param {any} models: All Loopback models to be generated
 * @returns {string}:   graphql schema
 */
function generateTypeDefs(models) {
    console.log('Models', generateModels(models));

    return [
        `scalar Date 
            scalar JSON `,
        generateModels(models),
        `type Query { 
            ${generateRootQueries(models)} 
            }`,
        `type Mutation { 
            ${generateSaves(models)}
            ${generateDeletes(models)} 
            ${generateMethods(models)}   
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