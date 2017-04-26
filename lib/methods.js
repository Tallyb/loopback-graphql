"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
function generateAccepts(name, props) {
    var ret = _.map(props, function (prop) {
        var propType = prop.type;
        if (_.isArray(prop.type)) {
            propType = prop.type[0];
        }
        return propType ? prop.arg + ": [" + utils.toType(prop.type[0]) + "]" + (prop.required ? '!' : '') : '';
    }).join(' \n ');
    return ret ? "(" + ret + ")" : '';
}
function generateReturns(name, props) {
    if (_.isObject(props)) {
        props = [props];
    }
    var args;
    args = _.map(props, function (prop) {
        if (_.isArray(prop.type)) {
            return prop.arg + ": [" + utils.toType(prop.type[0]) + "]" + (prop.required ? '!' : '');
        }
        else if (utils.toType(prop.type)) {
            return prop.arg + ": " + utils.toType(prop.type) + (prop.required ? '!' : '');
        }
        return '';
    }).join(' \n ');
    return args ? "{" + args + "}" : '';
}
function generateMethods(model) {
    return _.chain(model.sharedClass.methods())
        .map(function (method) {
        if (method.accessType === 'WRITE' && method.http.path) {
            return utils.methodName(method) + "\n                        " + generateAccepts(method.name, method.accepts) + "\n                        " + generateReturns(method.name, method.returns) + "\n                    : JSON";
        }
        else {
            return undefined;
        }
    })
        .compact()
        .value()
        .join(' \n ');
}
exports.default = generateMethods;
//# sourceMappingURL=methods.js.map