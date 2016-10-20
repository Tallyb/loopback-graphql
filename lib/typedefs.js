'use strict';

var _ = require('lodash');
//var debug = require('debug')('typedefs');
var helper = require('./helper');

const pagination = '(first: Int, after: Int)';

function generateDefinitions(model, forInput) {
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
***/
    var results = {
        types: [],
        props: []
    };

    _.forEach(model.definition.properties, (p, key) => {
        let prop = {
            name: key,
            required: p.required
        };
        let typeName = `${model.modelName}_${key}`;
        if (!p.deprecated) {
            if (p.enum) { //enumaration - add a type and prop
                prop.value = typeName;
                results.types.push({
                    type: 'enum',
                    name: typeName,
                    value: p.enum.join(' \n '),
                    required: p.required
                });
            } else if (helper.SCALARS[p.type.name]) { // simple scalar - add prop only
                prop.value = helper.SCALARS[p.type.name];
            } else if (p.type.name === 'Array') {} else if (p.type.name === 'Object') {} else if (p.type.name === 'ModelConstructor') { //complex object such as union or subtype
                let union = p.type.modelName.split('|');
                if (union.length > 0) { // union type
                    prop.value = typeName;
                    results.types.push({
                        name: typeName,
                        type: 'union',
                        value: p.type.modelName,
                        required: p.required
                    });
                } else {
                    prop.value = p.type.modelName;
                }
            } else if (_.isArray(p.type)) {
                prop.value = `[${p.type[0].name}]`;
            }
        }
        results.props.push(prop);
    });
    // result.types.push(`enum ${typeName} { ${p.enum.join(' \n ')} }`);
    // result.props.push[`${key}: ${typeName}${p.required ? '!' : ''}`];
    // `${key}: ${p.type.modelName}Input${p.required ? '!' : ''}`;
    //ToDo map to props, types and input types
    return results;
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
        let definitions = generateDefinitions(model);
        let rels = generateRelations(model.relations);

        let types = `type ${model.modelName} {
            ${definitions.props}
            ${rels}    
        }`;
        let inputs = `input ${model.modelName}Input {
            ${definitions.types}
        }`;
        return `
            type 
            ${types}
            ${inputs}
        `;
    }).join(' ');
}

function generateRootQueries(models) {
    return _.map(helper.sharedModels(models), model => {
        return `
                ${model.modelName} (id: ID!): ${model.modelName} 
                ${model.pluralModelName} ${pagination}: [${model.modelName}]
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

function generateTypeDefs(models) {

    return [
        'scalar Date',
        generateModels(models),
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