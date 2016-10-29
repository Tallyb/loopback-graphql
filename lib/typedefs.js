'use strict';

var _ = require('lodash');
//var debug = require('debug')('typedefs');
var helper = require('./helper');

const pagination = '(first: Int, after: Int)';

function generateDefinitions(name, properties) {
    /*** Loopback Types
    any - JSON
    Array - [scalar type]
    Boolean = boolean
    Buffer - not supported
    Date - Date (custom scalar)
    GeoPoint - not supported
    null - not supported
    Number = float
    Object = JSON
    String - string
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

function generateOutputProps(props, hiddenProps) {
    let visibleProps = _.filter(props, prop => hiddenProps.indexOf(prop.name) === -1);
    return _.map(visibleProps, prop => {
        return `${prop.name}: ${prop.value}${prop.required ? '!' : ''} `;
    }).join('');
}

function generateInputProps(props) {
    return _.map(props, prop => {
        if (prop.complex) {
            return `${prop.name}: ${prop.value}Input${prop.required ? '!' : ''} `;
        } else {
            return `${prop.name}: ${prop.value}${prop.required ? '!' : ''} `;
        }
    }).join(' ');
}

function generateModels(models) {
    return _.map(models, model => {
        console.log('MODEL: ', model.modelName);
        let definitions = generateDefinitions(model.modelName, model.definition.properties);
        let rels = generateRelations(model.relations);

        let outputProps = generateOutputProps(definitions.props, model.definition.settings.hidden);
        let inputProps = generateInputProps(definitions.props);

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

function generateParams(name, props) {
    return _.map(props, prop => {
        if (_.isArray(prop.type)) {
            return `${prop.arg}: [${helper.SCALARS[prop.type[0]]}]${prop.required ? '!' : ''}`;
        } else if (helper.SCALARS[prop.type]) {
            return `${prop.arg}: ${helper.SCALARS[prop.type]}${prop.required ? '!' : ''}`;
        } else {
            return '';
        }
    }).join(' ');
}

function generateMethods(models) {
    return _.map(helper.sharedModels(models), model => {
        return _.chain(model.sharedClass.methods())
            .map(method => {
                if (method.accessType !== 'READ' &&
                    method.accessType !== 'WRITE' &&
                    method.http.path) {
                    return `${method.http.path.replace('/','')} (
                        ${generateParams(method.name, method.accepts)}
                    ): ${generateParams(method.name, method.returns)} `;
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
