'use strict';

var _ = require('lodash');

const typesMapping = {
    Number: 'Float',
    String: 'String',
    Boolean: 'Boolean',
    ObjectID: 'ID',
    Date: 'Date'
};

function mapEnums(model) {
    return _.map(model.definition.properties, (p, key) => {
        return p.enum ? `enum ${key} { ${p.enum.join('\n ')} }` : '';
    });
}

function mapProps(model) {
    return _.map(model.definition.properties, (p, key) => {
        let req = p.required ? '!' : '';
        let type = p.enum ? key : typesMapping[p.type.name];
        return !p.deprecated ? `${key}: ${type}${req} ` : '';
    }).join('\n ');
}

module.exports = {
    mapEnums,
    mapProps
};