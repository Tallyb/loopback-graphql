'use strict';

const _ = require('lodash');
const utils = require('./utils');

/*** Loopback Types - GraphQL types
        any - JSON
        Array - [JSON]
        Boolean = boolean
        Buffer - not supported
        Date - Date (custom scalar)
        GeoPoint - not supported
        null - not supported
        Number = float
        Object = JSON (custom scalar)
        String - string
    ***/

let types = {};

const SCALARS = {
    number: 'Float',
    string: 'String',
    boolean: 'Boolean',
    objectid: 'ID',
    date: 'Date',
    object: 'JSON'
};

const PAGINATION = 'where: JSON, after: String, first: Int, before: String, last: Int';
const IDPARAMS = 'id: ID!';

function getScalar(type) {
    return SCALARS[type.toLowerCase().trim()];
}

function toTypes(union) {
    return _.map(union, type => {
        return getScalar(type) ? getScalar(type) : type;
    });
}

function mapProperty(model, property, modelName, propertyName) {
    if (property.deprecated) {
        return;
    }
    types[modelName].fields[propertyName] = {
        required: property.required,
        hidden: model.definition.settings.hidden && model.definition.settings.hidden.indexOf(propertyName) !== -1
    };
    let currentProperty = types[modelName].fields[propertyName];

    let typeName = `${modelName}_${propertyName}`;
    let propertyType = property.type;

    if (propertyType.name === 'Array') { // JSON Array
        currentProperty.list = true;
        currentProperty.gqlType = 'JSON';
        currentProperty.scalar = true;
        return;
    }

    if (_.isArray(property.type)) {
        currentProperty.list = true;
        propertyType = property.type[0];
    }

    let scalar = getScalar(propertyType.name);
    if (scalar) {
        currentProperty.scalar = true;
        currentProperty.gqlType = scalar;
        if (property.enum) { // enum has a dedicated type but no input type is required
            types[typeName] = {
                values: property.enum,
                category: 'ENUM'
            };
            currentProperty.gqlType = typeName;
        }
    }

    if (propertyType.name === 'ModelConstructor') {
        currentProperty.gqlType = propertyType.modelName;
        let union = propertyType.modelName.split('|');
        //type is a union
        if (union.length > 1) { // union type
            types[typeName] = { // creating a new union type
                category: 'UNION',
                values: toTypes(union)
            };
        } else if (propertyType.settings && propertyType.settings.anonymous && propertyType.definition) {
            currentProperty.gqlType = typeName;
            types[typeName] = {
                category: 'TYPE',
                input: true,
                fields: {}
            }; // creating a new type
            _.forEach(propertyType.definition.properties, (p, key) => {
                mapProperty(propertyType, p, typeName, key);
            });
        }
    }
}

function mapRelation(rel, modelName, relName) {
    types[modelName].fields[relName] = {
        relation: true,
        embed: rel.embed,
        gqlType: utils.connectionTypeName(rel.modelTo),
        args: PAGINATION,
        multiple: rel.multiple,
        to: rel.modelTo,
        from: rel.modelFrom
    };
}

function mapRoot(model) {
    types.Query.fields[model.modelName] = {
        relation: true,
        args: IDPARAMS,
        root: true,
        gqlType: utils.singularModelName(model)
    };

    types.Query.fields[utils.pluralModelName(model)] = {
        relation: true,
        root: true,
        args: PAGINATION,
        gqlType: utils.connectionTypeName(model)
    };

    types.Mutation.fields[`save${utils.singularModelName(model)}`] = {
        relation: true,
        args: `obj: ${model.modelName}Input!`,
        gqlType: ` ${model.modelName}`
    };

    types.Mutation.fields[`delete${utils.singularModelName(model)}`] = {
        relation: true,
        args: IDPARAMS,
        gqlType: ` ${model.modelName}`
    };
}

function mapConnection(model) {
    types[utils.connectionTypeName(model)] = {
        connection: true,
        category: 'TYPE',
        fields: {
            pageInfo: {
                required: true,
                gqlType: 'pageInfo'
            },
            edges: {
                list: true,
                gqlType: utils.edgeTypeName(model)
            },
            totalCount: {
                gqlType: 'Int',
                scalar: true
            },
            [model.pluralModelName]: {
                gqlType: model.modelName,
                list: true
            }
        }
    };
    types[utils.edgeTypeName(model)] = {
        category: 'TYPE',
        fields: {
            node: {
                gqlType: model.modelName,
                required: true
            },
            cursor: {
                gqlType: 'String',
                required: true
            }
        }
    };
}

// builduing types for all models and relationships
module.exports = function abstractTypes(models) {
    //building all models types & relationships
    types.pageInfo = {
        category: 'TYPE',
        fields: {
            hasNextPage: {
                gqlType: 'Boolean',
                required: true
            },
            hasPreviousPage: {
                gqlType: 'Boolean',
                required: true
            },
            startCursor: {
                gqlType: 'String'
            },
            endCursor: {
                gqlType: 'String'
            }
        }
    };
    types.Query = {
        category: 'TYPE',
        fields: {}
    };
    types.Mutation = {
        category: 'TYPE',
        fields: {}
    };

    _.forEach(models, model => {
        if (model.shared) {
            mapRoot(model);
        }
        types[utils.singularModelName(model)] = {
            category: 'TYPE',
            input: true,
            fields: {}
        };
        _.forEach(model.definition.properties, (property, key) => {
            mapProperty(model, property, model.modelName, key);
        });

        mapConnection(model);
        _.forEach(utils.sharedRelations(model), rel => {
            mapRelation(rel, model.modelName, rel.name);
            mapConnection(rel.modelTo);
        });
    });

    return types;

};