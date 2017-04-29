"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var utils_1 = require("./utils");
var execution_1 = require("./execution");
var types = {};
var exchangeTypes = {
    'any': 'JSON',
    'Any': 'JSON',
    'Number': 'Int',
    'number': 'Int',
    'Object': 'JSON',
    'object': 'JSON',
};
var SCALARS = {
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
    uuidv4: 'ID',
    geopoint: 'GeoPoint',
};
var PAGINATION = 'where: JSON, after: String, first: Int, before: String, last: Int';
var IDPARAMS = 'id: ID!';
function getScalar(type) {
    return SCALARS[type.toLowerCase().trim()];
}
function toTypes(union) {
    return _.map(union, function (type) {
        return getScalar(type) ? getScalar(type) : type;
    });
}
function mapProperty(model, property, modelName, propertyName) {
    if (property.deprecated) {
        return;
    }
    types[modelName].fields[propertyName] = {
        required: property.required,
        hidden: model.definition.settings.hidden && model.definition.settings.hidden.indexOf(propertyName) !== -1,
    };
    var currentProperty = types[modelName].fields[propertyName];
    var typeName = modelName + "_" + propertyName;
    var propertyType = property.type;
    if (propertyType.name === 'Array') {
        currentProperty.list = true;
        currentProperty.gqlType = 'JSON';
        currentProperty.scalar = true;
        return;
    }
    if (_.isArray(property.type)) {
        currentProperty.list = true;
        propertyType = property.type[0];
    }
    var scalar = getScalar(propertyType.name);
    if (property.defaultFn) {
        scalar = getScalar(property.defaultFn);
    }
    if (scalar) {
        currentProperty.scalar = true;
        currentProperty.gqlType = scalar;
        if (property.enum) {
            types[typeName] = {
                values: property.enum,
                category: 'ENUM',
            };
            currentProperty.gqlType = typeName;
        }
    }
    if (propertyType.name === 'ModelConstructor' && property.defaultFn !== 'now') {
        currentProperty.gqlType = propertyType.modelName;
        var union = propertyType.modelName.split('|');
        if (union.length > 1) {
            types[typeName] = {
                category: 'UNION',
                values: toTypes(union),
            };
        }
        else if (propertyType.settings && propertyType.settings.anonymous && propertyType.definition) {
            currentProperty.gqlType = typeName;
            types[typeName] = {
                category: 'TYPE',
                input: true,
                fields: {},
            };
            _.forEach(propertyType.definition.properties, function (p, key) {
                mapProperty(propertyType, p, typeName, key);
            });
        }
    }
}
function mapRelation(rel, modelName, relName) {
    types[modelName].fields[relName] = {
        relation: true,
        embed: rel.embed,
        gqlType: utils_1.connectionTypeName(rel.modelTo),
        args: PAGINATION,
        resolver: function (obj, args, context) {
            return execution_1.findRelated(rel, obj, args, context);
        },
    };
}
function addRemoteHooks(model) {
    _.map(model.sharedClass._methods, function (method) {
        if (method.accessType !== 'READ' && method.http.path) {
            var acceptingParams_1 = '', returnType = 'JSON';
            method.accepts.map(function (param) {
                var paramType = '';
                if (typeof param.type === 'object') {
                    paramType = 'JSON';
                }
                else {
                    if (!SCALARS[param.type.toLowerCase()]) {
                        paramType = param.type + "Input";
                    }
                    else {
                        paramType = _.upperFirst(param.type);
                    }
                }
                if (param.arg) {
                    acceptingParams_1 += param.arg + ": " + (exchangeTypes[paramType] || paramType) + " ";
                }
            });
            if (method.returns && method.returns[0]) {
                if (!SCALARS[method.returns[0].type] && typeof method.returns[0].type !== 'object') {
                    returnType = "" + method.returns[0].type;
                }
                else {
                    returnType = "" + _.upperFirst(method.returns[0].type);
                    if (typeof method.returns[0].type === 'object') {
                        returnType = 'JSON';
                    }
                }
            }
            types.Mutation.fields["" + utils_1.methodName(method, model)] = {
                relation: true,
                args: acceptingParams_1,
                gqlType: "" + (exchangeTypes[returnType] || returnType),
            };
        }
    });
}
function mapRoot(model) {
    types.Query.fields[utils_1.singularModelName(model)] = {
        relation: true,
        args: IDPARAMS,
        root: true,
        gqlType: utils_1.singularModelName(model),
        resolver: function (obj, args, context) {
            execution_1.findOne(model, obj, args, context);
        },
    };
    types.Query.fields[utils_1.pluralModelName(model)] = {
        relation: true,
        root: true,
        args: PAGINATION,
        gqlType: utils_1.connectionTypeName(model),
        resolver: function (obj, args, context) {
            execution_1.findAll(model, obj, args, context);
        },
    };
    types.Mutation.fields["save" + utils_1.singularModelName(model)] = {
        relation: true,
        args: "obj: " + utils_1.singularModelName(model) + "Input!",
        gqlType: utils_1.singularModelName(model),
        resolver: function (context, args) { return model.upsert(args.obj); },
    };
    types.Mutation.fields["delete" + utils_1.singularModelName(model)] = {
        relation: true,
        args: IDPARAMS,
        gqlType: " " + utils_1.singularModelName(model),
        resolver: function (context, args) {
            return model.findById(args.id)
                .then(function (instance) { return instance.destroy(); });
        },
    };
    addRemoteHooks(model);
}
function mapConnection(model) {
    types[utils_1.connectionTypeName(model)] = {
        connection: true,
        category: 'TYPE',
        fields: (_a = {
                pageInfo: {
                    required: true,
                    gqlType: 'pageInfo',
                },
                edges: {
                    list: true,
                    gqlType: utils_1.edgeTypeName(model),
                    resolver: function (obj, args, context) {
                        return _.map(obj.list, function (node) {
                            return {
                                cursor: utils_1.idToCursor(node[model.getIdName()]),
                                node: node,
                            };
                        });
                    },
                },
                totalCount: {
                    gqlType: 'Int',
                    scalar: true,
                    resolver: function (obj, args, context) {
                        return obj.count;
                    },
                }
            },
            _a[model.pluralModelName] = {
                gqlType: utils_1.singularModelName(model),
                list: true,
                resolver: function (obj, args, context) {
                    return obj.list;
                },
            },
            _a),
        resolver: function (obj, args, context) {
            return execution_1.resolveConnection(model);
        },
    };
    types[utils_1.edgeTypeName(model)] = {
        category: 'TYPE',
        fields: {
            node: {
                gqlType: utils_1.singularModelName(model),
                required: true,
            },
            cursor: {
                gqlType: 'String',
                required: true,
            },
        },
    };
    var _a;
}
function abstractTypes(models) {
    types.pageInfo = {
        category: 'TYPE',
        fields: {
            hasNextPage: {
                gqlType: 'Boolean',
                required: true,
            },
            hasPreviousPage: {
                gqlType: 'Boolean',
                required: true,
            },
            startCursor: {
                gqlType: 'String',
            },
            endCursor: {
                gqlType: 'String',
            },
        },
    };
    types.Query = {
        category: 'TYPE',
        fields: {},
    };
    types.Mutation = {
        category: 'TYPE',
        fields: {},
    };
    _.forEach(models, function (model) {
        if (model.shared) {
            mapRoot(model);
        }
        types[utils_1.singularModelName(model)] = {
            category: 'TYPE',
            input: true,
            fields: {},
        };
        _.forEach(model.definition.properties, function (property, key) {
            mapProperty(model, property, utils_1.singularModelName(model), key);
        });
        mapConnection(model);
        _.forEach(utils_1.sharedRelations(model), function (rel) {
            mapRelation(rel, utils_1.singularModelName(model), rel.name);
            mapConnection(rel.modelTo);
        });
    });
    return types;
}
exports.abstractTypes = abstractTypes;
