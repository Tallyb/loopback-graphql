'use strict';

var _ = require('lodash');
//var debug = require('debug')('typedefs');
var helper = require('./helper');

function generateAccepts(name, props) {
    let ret = _.map(props, prop => {
        let propType = prop.type;
        if (_.isArray(prop.type)) {
            propType = prop.type[0];
        }
        return propType ? `${prop.arg}: [${helper.toType(prop.type[0])}]${prop.required ? '!' : ''}` : '';
    }).join(' \n ');
    return ret ? `(${ret})` : '';

}

function generateReturns(name, props) {
    if (_.isObject(props)) {
        props = [props];
    }
    let args;
    args = _.map(props, prop => {
        if (_.isArray(prop.type)) {
            return `${prop.arg}: [${helper.toType(prop.type[0])}]${prop.required ? '!' : ''}`;
        } else if (helper.toType(prop.type)) {
            return `${prop.arg}: ${helper.toType(prop.type)}${prop.required ? '!' : ''}`;
        }
        return '';
    }).join(' \n ');
    return args ? `{${args}}` : '';
}

module.exports = function generateMethods(models) {
    return _.map(helper.sharedModels(models), model => {
        return _.chain(model.sharedClass.methods())
            .map(method => {
                if (method.accessType !== 'READ' &&
                    method.accessType !== 'WRITE' &&
                    method.http.path) {
                    return `${method.http.path.replace('/', '')} 
                        ${generateAccepts(method.name, method.accepts)}
                        ${generateReturns(method.name, method.returns)}
                    : JSON`;
                } else {
                    return undefined;
                }
            })
            .compact()
            .value()
            .join(' \n ');
    }).join(' \n ');
};
