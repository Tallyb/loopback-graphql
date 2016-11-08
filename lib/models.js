'use strict';

var _ = require('lodash');
//var debug = require('debug')('typedefs');
var helper = require('./helper');
var connections = require('./connections');

function propType(p, prop, typeName, types) {
    /*** Loopback Types - GraphQL types
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
    if (p.enum) {
        //enumaration - add a type and prop
        prop.value = typeName;
        types[typeName] = {
            type: 'enum',
            name: typeName,
            value: `{${p.enum.join(' \n ')}} `
        };
    } else if (p.type.name === 'Array') {
        //array type - add array of value
        prop.value = `[${helper.toType(p.type.name)}]`;

    } else if (p.type.name === 'ModelConstructor') {
        //complex object such as union or subtype - create type
        prop.input = true;
        let union = p.type.modelName.split('|');
        //type is a union
        if (union.length > 1) { // union type
            prop.input = false;
            prop.value = typeName;
            //let unionValues = _.map(union, val => helper.toType(val)).join(' | ');
            types[typeName] = {
                name: typeName,
                type: 'union',
                value: `${_.map(union, helper.toType).join(' | ')} `
            };
        } else {
            prop.value = p.type.modelName;
        }
    } else if (_.isArray(p.type)) {
        prop.value = `[${helper.toType(p.type[0].name)}]`;
    } else {
        // simple scalar - add value
        prop.value = helper.toType(p.type.name);
    }
    return prop;
}

function generateDefinitions(model) {
    var results = {
        types: {},
        props: {}
    };

    _.forEach(model.definition.properties, (p, key) => {
        let prop = {
            name: key,
            required: p.required,
            output: true, // included in output model
            input: false // included in input model
        };

        // property is hidden
        if (model.definition.settings.hidden && model.definition.settings.hidden.indexOf(key) !== -1) {
            prop.output = false;
        }

        if (!p.deprecated) {
            let typeName = `${model.modelName}_${key}`;
            prop = propType(p, prop, typeName, results.types);
            results.props[key] = prop;
        }
    });
    return results;
}

function relations(relations) {
    return _.chain(relations)
        .map((rel, key) => {
            if (rel.modelTo.shared) {
                return rel.multiple ?
                    `${rel.name} ${helper.PAGINATION}: [${rel.modelTo.modelName}]` :
                    `${rel.name}: ${rel.modelTo.modelName}`;
            } else {
                return undefined;
            }
        })
        .compact()
        .value()
        .join(' \n ');
}

function generateOutputProps(props) {
    return _.chain(props)
        .filter({
            output: true
        })
        .map(prop => {
            return `${prop.name}: ${prop.value}${prop.required ? '!' : ''} `;
        })
        .value()
        .join(' \n ');
}
// generates the input model with complex input values
function generateInputProps(props) {
    return _.map(props, prop => {
        return `${prop.name}: ${prop.value}${prop.input ? 'Input' : ''}${prop.required ? '!' : ''} `;
    }).join(' \n ');
}

module.exports = function generateModels(models) {
    return _.map(models, model => {

        let definitions = generateDefinitions(model);

        let types = _.map(definitions.types, t => {
            const assignment = {
                enum: '',
                union: '='
            };
            return `${t.type} ${t.name} ${assignment[t.type]} ${t.value} `;
        }).join(' ');

        let outputModel = `type ${model.modelName} {
            ${generateOutputProps(definitions.props)}
            ${relations(model.relations)}    
        }`;
        console.log('OUTPUT MODEL', outputModel);

        let inputModel = `input ${model.modelName}Input {
            ${generateInputProps(definitions.props)}
        }`;
        console.log('INPUT MODEL', inputModel);
        console.log('CONNECTION TYPE', connections.connectionType(model));
        console.log('EDGE TYPE', connections.edgeType(model));

        return ` 
            ${types} 
            ${outputModel}
            ${inputModel}
            ${connections.connectionType(model)}
            ${connections.edgeType(model)}
        `;
    }).join(' ');
};