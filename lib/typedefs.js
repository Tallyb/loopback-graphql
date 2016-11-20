'use strict';

const _ = require('lodash');
const base = require('./base');

function args(args) {
    return args ? `(${args})` : '';
}

function generateInputField(field, name) {
    return `
        ${name} : ${field.list ? '[' : ''}${field.gqlType}${field.scalar ? '' : 'Input'}${field.required ? '!' : ''} ${field.list ? ']' : ''}`;
}

function generateOutputField(field, name) {
    return `${name} ${args(field.args)} : ${field.list ? '[' : ''}${field.gqlType}${field.required ? '!' : ''} ${field.list ? ']' : ''}`;
}

module.exports = function generateTypeDefs(types) {
    const categories = {
        TYPE: (type, name) => {
            let output = _.reduce(type.fields, (result, field, fieldName) => {
                return result + generateOutputField(field, fieldName) + ' \n ';
            }, '');

            var result = `
                type ${name} {
                    ${output}
                }`;
            if (type.input) {
                let input = _.reduce(type.fields, (result, field, fieldName) => {
                    if (!field.relation) {
                        return result + generateInputField(field, fieldName) + ' \n ';
                    } else {
                        return result;
                    }

                }, '');
                result += `input ${name}Input {
                    ${input}
                }`;
            }
            return result;
        },
        UNION: (type, name) => {
            return `union ${name} = ${type.values.join(' | ')}`;
        },
        ENUM: (type, name) => {
            return `enum ${name} {${type.values.join(' ')}}`;
        }
    };

    return _.reduce(types, (result, type, name) => {
        return result + categories[type.category](type, name);
    }, base.typeDefs);
};