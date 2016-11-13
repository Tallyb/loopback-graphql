'use strict';

var _ = require('lodash');

var utils = require('./utils');
var query = require('./query');
var mutation = require('./mutation');
var properties = require('./properties');
var connections = require('./connections');
var base = require('./base');

function rootQueries(models) {
    return _.map(utils.sharedModels(models), model => {
        return query.typeDefs(model);
    }).join(' ');
}

function rootMutations(models) {
    return _.map(utils.sharedModels(models), model => {
        return mutation.typeDefs(model);
    }).join(' ');
}

function modelTypes(models) {
    return _.map(models, model => {
        return `
            ${properties.typeDefs(model)}
            ${connections.typeDefs(model)}
        `;
    }).join(' ');
}

/**
 * Generates all typedef schema for the models
 *
 * @param {any} models: All Loopback models to be generated
 * @returns {string}:   graphql schema
 */
module.exports = function typeDefs(models) {
    return [
        base.typeDefs,
        modelTypes(models),
        `type Query { 
            ${rootQueries(models)} 
        }`,
        `type Mutation { 
            ${rootMutations(models)}
        }`,
        `schema {
            query: Query
            mutation: Mutation
        }`
    ];
};