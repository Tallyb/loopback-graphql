'use strict';
//var _ = require('lodash');
const gqlLang = require('graphql/language');

const typeDefs = `
        scalar Date 
        scalar JSON
        `;

function parseJSONLiteral(ast) {
    switch (ast.kind) {
        case gqlLang.Kind.STRING:
        case gqlLang.Kind.BOOLEAN:
            return ast.value;
        case gqlLang.Kind.INT:
        case gqlLang.Kind.FLOAT:
            return parseFloat(ast.value);
        case gqlLang.Kind.OBJECT:
            {
                const value = Object.create(null);
                ast.fields.forEach(field => {
                    value[field.name.value] = parseJSONLiteral(field.value);
                });

                return value;
            }
        case gqlLang.Kind.LIST:
            return ast.values.map(parseJSONLiteral);
        default:
            return null;
    }
}

const resolvers = {
    Date: {
        __parseValue(value) {
            return new Date(value); // value from the client
        },
        __serialize(value) {
            return value.getTime(); // value sent to the client
        },
        __parseLiteral(ast) {
            if (ast.kind === gqlLang.Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        }
    },
    JSON: {
        __parseLiteral: parseJSONLiteral,
        __serialize: value => value,
        __parseValue: value => value
    }

};

module.exports = {
    typeDefs,
    resolvers
};