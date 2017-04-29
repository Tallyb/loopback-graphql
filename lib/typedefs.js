"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var scalarTypes = "\n        scalar Date\n        scalar JSON\n        scalar GeoPoint\n        ";
function args(args) {
    return args ? "(" + args + ")" : '';
}
function generateInputField(field, name) {
    return "\n        " + name + " : " + (field.list ? '[' : '') + "\n        " + field.gqlType + (field.scalar ? '' : 'Input') + (field.required ? '!' : '') + " " + (field.list ? ']' : '');
}
function generateOutputField(field, name) {
    return name + " " + args(field.args) + " : " + (field.list ? '[' : '') + field.gqlType + (field.required ? '!' : '') + " " + (field.list ? ']' : '');
}
function generateTypeDefs(types) {
    var categories = {
        TYPE: function (type, name) {
            var output = _.reduce(type.fields, function (result, field, fieldName) {
                return result + generateOutputField(field, fieldName) + ' \n ';
            }, '');
            var result = "\n                type " + name + " {\n                    " + output + "\n                }";
            if (type.input) {
                var input = _.reduce(type.fields, function (accumulator, field, fieldName) {
                    return !field.relation ? accumulator + generateInputField(field, fieldName) + ' \n ' : accumulator;
                }, '');
                result += "input " + name + "Input {\n                    " + input + "\n                }";
            }
            return result;
        },
        UNION: function (type, name) {
            return "union " + name + " = " + type.values.join(' | ');
        },
        ENUM: function (type, name) {
            return "enum " + name + " {" + type.values.join(' ') + "}";
        },
    };
    return _.reduce(types, function (result, type, name) {
        return result + categories[type.category](type, name);
    }, scalarTypes);
}
exports.generateTypeDefs = generateTypeDefs;
//# sourceMappingURL=typedefs.js.map