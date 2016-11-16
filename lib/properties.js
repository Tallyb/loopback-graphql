'use strict';

var _ = require('lodash');
//var utils = require('./utils');
var relations = require('./relations');

/*** Loopback Types - GraphQL types
        any - JSON
        Array - [scalar type]
        Boolean = boolean
        Buffer - not supported
        Date - Date (custom scalar)
        GeoPoint - not supported
        null - not supported
        Number = float
        Object = JSON (custom scalar)
        String - string
    ***/

function typeDefs(models) {
    let types = {};

    const SCALARS = {
        number: 'Float',
        string: 'String',
        boolean: 'Boolean',
        objectid: 'ID',
        date: 'Date',
        object: 'JSON'
    };

    function toType(type) {
        let scalar = SCALARS[type.toLowerCase().trim()];
        return scalar ? scalar : type;
    }

    function mapProperty(model, property, name) {
        if (property.deprecated) {
            return;
        }
        let currentProperty = types[model.modelName][name];
        let typeName = `${model.modelName}_${name}`;
        currentProperty = {
            required: property.required,
            hidden: model.definition.settings.hidden && model.definition.settings.hidden.indexOf(name) !== -1
        };

        if (property.enum) {
            //enumaration - add a type and prop
            types[typeName] = {
                values: `{${property.enum.join(' \n ')}} `,
                category: 'ENUM'
            };
            currentProperty.gqlType = typeName;
        }
        if (property.type.name === 'Array') {
            //array type - add array of value
            currentProperty.list = true;
        }
        if (property.type.name === 'ModelConstructor') {
            if (property.type.definition.settings.anonymous) {
                types[typeName] = {}; // creating a new type
                _.forEach(property.type.definition.properties, p => {
                    mapProperty(property.type, p, property.type.modelName);
                });
            } else {
                let union = property.type.modelName.split('|');
                //type is a union
                if (union.length > 1) { // union type
                    types[typeName] = { // creating a new union type
                        category: 'UNION',
                        values: `${_.map(union, toType).join(' | ')} `
                    };
                }
            }
            currentProperty.gqlType = typeName;
        } else if (_.isArray(property.type)) {
            currentProperty.list = true;
            currentProperty.gqlType = property.type[0].name;
        } else {

            // simple scalar - add value
            currentProperty.gqlTypeprop = toType(property.type.name);
        }

    }

    //building all models types
    _.forEach(models, model => {
        types[model.modelName] = {};
        _.forEach(model.definition.properties, (property, key) => {
            mapProperty(model, property, key);
        });

    });

    // return output types, input types, enums and unions
    //add relationships to output types
    // function generateOutputProps(props) {
    //     return _.chain(props)
    //         .filter({
    //             output: true
    //         })
    //         .map(prop => {
    //             return `${prop.name}: ${prop.value}${prop.required ? '!' : ''} `;
    //         })
    //         .value()
    //         .join(' \n ');
    // }

    // function generateInputProps(props) {
    //     return _.map(props, prop => {
    //         return `${prop.name}: ${prop.value}${prop.input ? 'Input' : ''}${prop.required ? '!' : ''} `;
    //     }).join(' \n ');
    // }
    // _.forEach(types, t => {
    //     result = '';
    //     if (!t.hidden) {
    //         result += `${t.type} ${t.name} : ${t.value}`;
    //     }
    //     return ;
    // })
    // let types = _.map(definitions.types, t => {
    //     const assignment = {
    //         enum: '',
    //         union: '='
    //     };

    // }).join(' ');

    // let outputModel = `type ${model.modelName} {
    //         ${generateOutputProps(definitions.props)}
    //         ${relations.typeDefs(model)}
    //     }`;
    // //    console.log('OUTPUT MODEL', outputModel);

    // let inputModel = `input ${model.modelName}Input {
    //         ${generateInputProps(definitions.props)}
    //     }`;

    return ` 
            ${types} 
            ${outputModel}
            ${inputModel}
        `;
}

module.exports = {
    typeDefs
};