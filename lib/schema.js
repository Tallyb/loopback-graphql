'use strict';

//const _ = require('lodash');
const graphql = require('graphql');
var GraphQLJSON = require('graphql-type-json');

'use strict';

const _ = require('lodash');
const utils = require('./utils');
const execution = require('./execution.js');

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

function getIdArgs() {
    return {
        id: graphql.GraphQLId
    };
}

function getPaginationArgs() {
    return {
        where: {
            type: GraphQLJSON
        },
        after: {
            type: graphql.GraphQLString
        },
        first: {
            type: graphql.GraphQLInt
        },
        before: {
            type: graphql.GraphQLString
        },
        last: {
            type: graphql.GraphQLInt
        }

    };
}

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
        args: getPaginationArgs(),
        resolver: (obj, args, context) => {
            return execution.findRelated(rel, obj, args, context);
        }
    };
}

function mapRoot(model) {
    types.Query.fields[utils.singularModelName(model)] = {
        relation: true,
        args: getIdArgs(),
        root: true,
        gqlType: utils.singularModelName(model),
        resolver: (obj, args, context) => {
            execution.findOne(model, obj, args, context);
        }
    };

    types.Query.fields[utils.pluralModelName(model)] = {
        relation: true,
        root: true,
        args: getPaginationArgs(),
        gqlType: utils.connectionTypeName(model),
        resolver: (obj, args, context) => {
            execution.findAll(model, obj, args, context);
        }
    };

    types.Mutation.fields[`save${utils.singularModelName(model)}`] = {
        relation: true,
        args: `obj: ${utils.singularModelName(model)}Input!`,
        gqlType: utils.singularModelName(model),
        resolver: (context, args) => model.upsert(args.obj)
    };

    types.Mutation.fields[`delete${utils.singularModelName(model)}`] = {
        relation: true,
        args: getIdArgs(),
        gqlType: ` ${utils.singularModelName(model)}`,
        resolver: (context, args) => {
            return model.findById(args.id)
                .then(instance => instance.destroy());
        }
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
                gqlType: utils.edgeTypeName(model),
                resolver: (obj, args, context) => {
                    return _.map(obj.list, node => {
                        return {
                            cursor: utils.idToCursor(node[model.getIdName()]),
                            node: node
                        };
                    });
                }
            },
            totalCount: {
                gqlType: 'Int',
                scalar: true,
                resolver: (obj, args, context) => {
                    return obj.count;
                }
            },
            [model.pluralModelName]: {
                gqlType: utils.singularModelName(model),
                list: true,
                resolver: (obj, args, context) => {
                    return obj.list;
                }
            }
        },
        resolver: (obj, args, context) => {
            return execution.resolveConnection(model, obj, args, context);
        }
    };
    types[utils.edgeTypeName(model)] = {
        category: 'TYPE',
        fields: {
            node: {
                gqlType: utils.singularModelName(model),
                required: true
            },
            cursor: {
                gqlType: 'String',
                required: true
            }
        }
    };
}
// building types for all models and relationships
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
            mapProperty(model, property, utils.singularModelName(model), key);
        });

        mapConnection(model);
        _.forEach(utils.sharedRelations(model), rel => {
            mapRelation(rel, utils.singularModelName(model), rel.name);
            mapConnection(rel.modelTo);
        });
    });
    return types;
};