'use strict';

var _ = require('lodash');

const typesMapping = {
    Number: 'Float',
    String: 'String',
    Boolean: 'Boolean',
    ObjectID: 'ID',
    Date: 'Date'
};

function validProps(model){
    return _.omitBy(model.definition.properties, p=>{
        return p.deprecated;
    });
}

function mapEnums(model) {
    return _.chain(validProps(model))
        .map((p, key) => {
            return p.enum ? `enum ${key} { ${p.enum.join(' \n ')} }` : undefined;
        })
        .compact()
        .join(' \n ');
}

function propsNames(model) {
    return _.chain(validProps(model))
        .map((p, key) => {
            return `${key}`;
        })
        .join(' \n ');
}

function propsTypes(model) {
    return _.chain(validProps(model))
        .map((p, key) => {
            let req = p.required ? '!' : '';
            let type = p.enum ? key : typesMapping[p.type.name];
            return `${key}: ${type}${req}`;
        })
        .join(' \n ');
}

function validRelations (model) {
    return _.omitBy(model.relations, r=>{
        return !r.shared;
    });
}

module.exports = {
    mapEnums,
    propsTypes,
    propsNames,
    validProps,
    validRelations
};