'use strict';

var _ = require('lodash');
var base = require('./base');

function params(params) {
    return params ? `(${params})` : '';
}

function generateInputField(field, name) {
    return `
        ${name} ${params(field.params)} : ${field.list ? '[' : ''}${field.gqlType}${field.required ? '!' : ''} ${field.list ? ']' : ''}`;
}

function generateOutputField(field, name) {
    return `${name} ${params(field.params)} : ${field.list ? '[' : ''}${field.gqlType}${field.required ? '!' : ''} ${field.list ? ']' : ''}`;
}

module.exports = function generateTypeDefs(types) {
    const categories = {
        TYPE: (type, name) => {
            let input = _.reduce(type.fields, (result, field, fieldName) => {
                return result + generateInputField(field, fieldName) + ' \n ';
            }, '');
            let output = _.reduce(type.fields, (result, field, fieldName) => {
                return result + generateOutputField(field, fieldName) + ' \n ';
            }, '');

            var result = `
                type ${name} {
                    ${input}
                }`;
            if (!type.connection && !type.root) {
                result += `input ${name}Input {
                    ${output}
                }`;
            }
            return result;
        },
        UNION: (type, name) => {
            return `UNION ${name} = ${type.values.join(' | ')}`;
        },
        ENUM: (type, name) => {
            return `ENUM ${name} {${type.values.join(' ')}}`;
        }
    };

    return _.reduce(types, (result, type, name) => {
        return result + categories[type.category](type, name);
    }, base.typeDefs);
};