'use strict';

var _ = require('lodash');
//var debug = require('debug')('typedefs');
var helper = require('./helper');

const pagination = '(first: Int, after: Int)';

function generateDefinitions(name, properties) {
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
        types: {},
        props: {}
    };

    _.forEach(properties, (p, key) => {
        let prop = {
            name: key,
            required: p.required
        };
        let useProp = true;
        let typeName = `${name}_${key}`;
        if (p.deprecated) {
            useProp = false;
        } else if (p.enum) { //enumaration - add a type and prop
            prop.value = typeName;
            results.types[typeName] = {
                type: 'enum',
                name: typeName,
                value: `{${p.enum.join(' \n ')}} `,
                assign: ''
            };
        } else if (helper.SCALARS[p.type.name]) { // simple scalar - add prop only
            prop.value = helper.SCALARS[p.type.name];
        } else if (p.type.name === 'Array') {
            useProp = false;
        } else if (p.type.name === 'Object') {
            useProp = false;
        } else if (p.type.name === 'ModelConstructor') { //complex object such as union or subtype
            prop.complex = true;
            let union = p.type.modelName.split('|');
            if (union.length > 1) { // union type
                useProp = false;
                prop.value = typeName;
                // results.types[typeName] = {
                //     name: typeName,
                //     type: 'union',
                //     value: p.type.modelName,
                //     assign: '='
                // };
            } else {
                prop.value = p.type.modelName;
            }
        } else if (_.isArray(p.type)) {
            prop.value = `[${helper.SCALARS[p.type[0].name]}]`;
        }
        if (useProp) {
            results.props[key] = prop;
        }
    });
    //console.log(results);
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
        .value()
        .join(' ');
}

function generateModels(models) {
    return _.map(models, model => {
        console.log('MODEL: ', model.modelName);
        let definitions = generateDefinitions(model.modelName, model.definition.properties);
        let rels = generateRelations(model.relations);
        let outputProps = _.map(definitions.props, prop => {
            return `${prop.name}: ${prop.value}${prop.required ? '!' : ''} `;
        }).join('');

        let inputProps = _.map(definitions.props, prop => {
            if (prop.complex) {
                return `${prop.name}: ${prop.value}Input${prop.required ? '!' : ''} `;
            } else {
                return `${prop.name}: ${prop.value}${prop.required ? '!' : ''} `;
            }
        });
        let types = _.map(definitions.types, t => {
            return `${t.type} ${t.name} ${t.assign} ${t.value} `;
        }).join(' ');
        console.log('TYPES', types);

        let outputModel = `type ${model.modelName} {
            ${outputProps}
            ${rels}    
        }`;
        console.log('OUTPUT MODEL', outputModel);

        let inputModel = `input ${model.modelName}Input {
            ${inputProps}
        }`;
        console.log('INPUT MODEL', inputModel);

        return ` 
            ${types} 
            ${outputModel} 
            ${inputModel} 
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

function generateMethods(models) {
    return _.map(helper.sharedModels(models), model => {
        return _.chain(model.sharedClass.methods())
            .map(method => {
                if (method.accessType !== 'READ' &&
                    method.accessType !== 'WRITE' &&
                    method.http.path) {
                    return `${method.http.path.replace('/','')} : ${model.modelName} `;
                } else {
                    return undefined;
                }
            })
            .compact()
            .value()
            .join(' ');
    }).join(' \n ');
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