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

const exchangeTypes = {
    'any': 'JSON',
    'Any': 'JSON',
    'Number': 'Int',
    'number': 'Int',
    'Object': 'JSON',
    'object': 'JSON'
};

const SCALARS = {
    any: 'JSON',
    number: 'Float',
    string: 'String',
    boolean: 'Boolean',
    objectid: 'ID',
    date: 'Date',
    object: 'JSON',
    now: 'Date',
    guid: 'ID',
    uuid: 'ID',
    uuidv4: 'ID'
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
    if (property.defaultFn) {
        scalar = getScalar(property.defaultFn);
    }
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

    if (propertyType.name === 'ModelConstructor' && property.defaultFn !== 'now') {
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
        resolver: (obj, args, context) => {
            return execution.findRelated(rel, obj, args, context);
        }
    };
}

/*
function generateReturns(name, props) {
    if (_.isObject(props)) {
        props = [props];
    }
    let args;
    args = _.map(props, prop => {
        if (_.isArray(prop.type)) {
            return `${prop.arg}: [${utils.toType(prop.type[0])}]${prop.required ? '!' : ''}`;
        } else if (utils.toType(prop.type)) {
            return `${prop.arg}: ${utils.toType(prop.type)}${prop.required ? '!' : ''}`;
        }
        return '';
    }).join(' \n ');
    return args ? `{${args}}` : '';
}

function generateAccepts(name, props) {
    let ret = _.map(props, prop => {
        let propType = prop.type;
        if (_.isArray(prop.type)) {
            propType = prop.type[0];
        }
        return propType ? `${prop.arg}: [${utils.toType(prop.type[0])}]${prop.required ? '!' : ''}` : '';
    }).join(' \n ');
    return ret ? `(${ret})` : '';

}
*/

function addRemoteHooks(model) {

    _.map(model.sharedClass._methods, method => {
        if (method.accessType !== 'READ' && method.http.path) {
            var acceptingParams = '',
                returnType = 'JSON';
            method.accepts.map(function(param) {
                var paramType = '';
                if (typeof param.type === 'object') {
                    paramType = 'JSON';
                } else {
                    if (!SCALARS[param.type.toLowerCase()]) {
                        paramType = `${param.type}Input`;
                    } else {
                        paramType = _.upperFirst(param.type);
                    }
                }
                if (param.arg) {
                    acceptingParams += `${param.arg}: ${exchangeTypes[paramType] || paramType} `;
                }
            });
            if (method.returns && method.returns[0]) {
                if (!SCALARS[method.returns[0].type] && typeof method.returns[0].type !== 'object') {
                    returnType = `${method.returns[0].type}`;
                } else {
                    returnType = `${_.upperFirst(method.returns[0].type)}`;
                    if (typeof method.returns[0].type === 'object') {
                        returnType = 'JSON';
                    }
                }
            }
            types.Mutation.fields[`${utils.methodName(method, model)}`] = {
                relation: true,
                args: acceptingParams,
                gqlType: `${exchangeTypes[returnType] || returnType}`
            };
        }
    });
}

function mapRoot(model) {
    types.Query.fields[utils.singularModelName(model)] = {
        relation: true,
        args: IDPARAMS,
        root: true,
        gqlType: utils.singularModelName(model),
        resolver: (obj, args, context) => {
            execution.findOne(model, obj, args, context);
        }
    };

    types.Query.fields[utils.pluralModelName(model)] = {
        relation: true,
        root: true,
        args: PAGINATION,
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
        args: IDPARAMS,
        gqlType: ` ${utils.singularModelName(model)}`,
        resolver: (context, args) => {
            return model.findById(args.id)
                .then(instance => instance.destroy());
        }
    };
    // _.each(model.sharedClass.methods, method => {
    //     if (method.accessType !== 'READ' && method.http.path) {
    //         let methodName = utils.methodName(method, model);
    //         types.Mutation.fields[methodName] = {
    //             gqlType: `${generateReturns(method.name, method.returns)}`,
    //             args: `${generateAccepts(method.name, method.accepts)}`
    //         }

    //         return `${utils.methodName(method)}
    //                     ${generateAccepts(method.name, method.accepts)}

    //                 : JSON`;
    //     } else {
    //         return undefined;
    //     }
    // });
    addRemoteHooks(model);
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
