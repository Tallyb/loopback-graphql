'use strict';

var _ = require('lodash');
var debug = require('debug')('typedefs');
var helper = require('./helper');

const pagination = '(first: Int, after: Int)';

function generateTypes(models) {
/*** Loopback Types
    any - not supported
    Array - not supported
    Boolean - supported = boolean
    Buffer - not supported
    Date - supported
    GeoPoint
    null
    Number - supported = float
    Object - not supported
    String - supported
*/
    var types = [];
    _.forEach(models, (model) => {
        _.forEach(model.definition.properties, (p, key) => {
            if (p.deprecated) {
                return;
            }
            if (p.enum) {
                types.push(`enum ${key} { ${p.enum.join(' \n ')} }`);
                return;
            }
            if (!helper.SCALARS[p.type.name]) {
                debug('Non Scalar type found: ', model.modelName, key);
                return;
            }
            if (p.type.name === 'Array') {
                debug('Array type found: ', model.modelName, key);
                return;
            }
            if (p.type.name === 'Object') {
                debug('Object type found: ', model.modelName, key);
            }
            if (p.type === 'ModelConstructor') {
                return;
            }
            return;
        });
    });
    return types.join(' \n ');
}

function generateProperties(props, forInput) {
    return _.map(props, (p, key) => {
        let result;
        if (p.deprecated) {
            // DO NOTHING
        } else if (helper.SCALARS[p.type.name]) {
            result = `${key}: ${helper.SCALARS[p.type.name]}${p.required ? '!' : ''}`;
        } else if (p.type.name === 'ModelConstructor') {
            result = !forInput ?
                `${key}: ${p.type.modelName}${p.required ? '!' : ''}` :
                `${key}: ${p.type.modelName}Input${p.required ? '!' : ''}`;
        } else if (_.isArray(p.type)) {
            result = !forInput ? `${key}: [${helper.SCALARS[p.type[0].name]}]` : undefined;
        } else {
            result = `${key}: ${key}${p.required ? '!' : ''}`;
        }
        return result ? result + ' \n ' : undefined;
    });
}

function generateRelations(relations) {
    return _.chain(relations)
        .map((rel, key) => {
            if (rel.modelTo.shared) {
                return rel.multiple ?
                    `${rel.name} ${pagination}: [${rel.modelTo.modelName}]` :
                    `${rel.name}: ${rel.modelTo.modelName}`;
            } else {
                return undefined;
            }
        })
        .compact()
        .join(' ');
}

function generateModels(models) {
    return _.map(models, model => {
        return `type ${model.modelName} {
            ${generateProperties(model.definition.properties)}
            ${generateRelations(model.relations)}    
        }`;
    }).join(' ');
}

function generateInputModels(models) {
    return _.map(models, model => {
        return `input ${model.modelName}Input {
            ${generateProperties(model.definition.properties, true)}
        }`;
    }).join(' ');
}

function generateRootQueries(models) {
    return _.map(helper.sharedModels(models), model => {
        return `
                ${model.modelName} (id: ID!): ${model.modelName} 
                ${model.pluralModelName} ${pagination}: [${model.modelName}]
            `;
    }).join(' ')
        ;
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

function generateTypeDefs(models) {

    return [
        'scalar Date',
        generateTypes(models),
        generateModels(models),
        generateInputModels(models),
        `type Query { 
            ${generateRootQueries(models)} 
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
