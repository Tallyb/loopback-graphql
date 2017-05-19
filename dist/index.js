module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(0);
var PAGINATION = '(where: JSON, after: String, first: Int, before: String, last: Int)';
exports.PAGINATION = PAGINATION;
function base64(i) {
    return (new Buffer(i, 'ascii')).toString('base64');
}
function unbase64(i) {
    return (new Buffer(i, 'base64')).toString('ascii');
}
var PREFIX = 'connection.';
/**
 * Creates the cursor string from an offset.
 * @param {String} id the id to convert
 * @returns {String}   an opaque cursor
 */
function idToCursor(id) {
    return base64(PREFIX + id);
}
exports.idToCursor = idToCursor;
/**
 * Rederives the offset from the cursor string.
 * @param {String} cursor   the cursor for conversion
 * @returns {String} id   converted id
 */
function cursorToId(cursor) {
    return unbase64(cursor).substring(PREFIX.length);
}
exports.cursorToId = cursorToId;
function getId(cursor) {
    if (cursor === undefined || cursor === null) {
        return null;
    }
    return cursorToId(cursor);
}
exports.getId = getId;
function connectionTypeName(model) {
    return model.modelName + "Connection";
}
exports.connectionTypeName = connectionTypeName;
function edgeTypeName(model) {
    return model.modelName + "Edge"; // e.g. UserEdge
}
exports.edgeTypeName = edgeTypeName;
function singularModelName(model) {
    return model.modelName;
}
exports.singularModelName = singularModelName;
function pluralModelName(model) {
    return 'all' + _.upperFirst(model.pluralModelName);
}
exports.pluralModelName = pluralModelName;
function sharedRelations(model) {
    return _.pickBy(model.relations, function (rel) { return rel.modelTo && rel.modelTo.shared; });
}
exports.sharedRelations = sharedRelations;
function sharedModels(models) {
    return _.filter(models, function (model) {
        return model.shared;
    });
}
exports.sharedModels = sharedModels;
function methodName(method, model) {
    return model.modelName + _.upperFirst(method.name);
}
exports.methodName = methodName;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(0);
var utils_1 = __webpack_require__(1);
function buildSelector(model, args) {
    var selector = {
        where: args.where || {},
        skip: undefined,
        limit: undefined,
        order: undefined,
    };
    var begin = utils_1.getId(args.after);
    var end = utils_1.getId(args.before);
    selector.skip = args.first - args.last || 0;
    selector.limit = args.last || args.first;
    selector.order = model.getIdName() + (end ? ' DESC' : ' ASC');
    if (begin) {
        selector.where[model.getIdName()] = selector[model.getIdName()] || {};
        selector.where[model.getIdName()].gt = begin;
    }
    if (end) {
        selector.where[model.getIdName()] = selector[model.getIdName()] || {};
        selector.where[model.getIdName()].lt = end;
    }
    return selector;
}
function findOne(model, obj, args, context) {
    var id = obj ? obj[model.getIdName()] : args.id;
    return model.findById(id);
}
exports.findOne = findOne;
function getCount(model, obj, args, context) {
    return model.count(args.where);
}
function getFirst(model, obj, args) {
    return model.findOne({
        order: model.getIdName() + (args.before ? ' DESC' : ' ASC'),
        where: args.where,
    })
        .then(function (res) {
        return res ? res.__data : {};
    });
}
function getList(model, obj, args) {
    return model.find(buildSelector(model, args));
}
function findAll(model, obj, args, context) {
    var response = {
        args: args,
        count: undefined,
        first: undefined,
        list: undefined,
    };
    return getCount(model, obj, args, undefined)
        .then(function (count) {
        response.count = count;
        return getFirst(model, obj, args);
    })
        .then(function (first) {
        response.first = first;
        return getList(model, obj, args);
    })
        .then(function (list) {
        response.list = list;
        return response;
    });
}
exports.findAll = findAll;
function findRelated(rel, obj, args, context) {
    if (_.isArray(obj[rel.keyFrom])) {
        return [];
    }
    args.where = (_a = {},
        _a[rel.keyTo] = obj[rel.keyFrom],
        _a);
    return findAll(rel.modelTo, obj, args, context);
    var _a;
}
exports.findRelated = findRelated;
function resolveConnection(model) {
    return _a = {},
        _a[utils_1.connectionTypeName(model)] = (_b = {
                totalCount: function (obj, args, context) {
                    return obj.count;
                },
                edges: function (obj, args, context) {
                    return _.map(obj.list, function (node) {
                        return {
                            cursor: utils_1.idToCursor(node[model.getIdName()]),
                            node: node,
                        };
                    });
                }
            },
            _b[model.pluralModelName] = function (obj, args, context) {
                return obj.list;
            },
            _b.pageInfo = function (obj, args, context) {
                var pageInfo = {
                    startCursor: null,
                    endCursor: null,
                    hasPreviousPage: false,
                    hasNextPage: false,
                };
                if (obj.count > 0) {
                    pageInfo.startCursor = utils_1.idToCursor(obj.list[0][model.getIdName()]);
                    pageInfo.endCursor = utils_1.idToCursor(obj.list[obj.list.length - 1][model.getIdName()]);
                    pageInfo.hasNextPage = obj.list.length === obj.args.limit;
                    pageInfo.hasPreviousPage = obj.list[0][model.getIdName()] !== obj.first[model.getIdName()].toString();
                }
                return pageInfo;
            },
            _b),
        _a;
    var _a, _b;
}
exports.resolveConnection = resolveConnection;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var graphql_server_express_1 = __webpack_require__(11);
var graphql_tools_1 = __webpack_require__(12);
var bodyParser = __webpack_require__(8);
var ast_1 = __webpack_require__(4);
var resolvers_1 = __webpack_require__(6);
var typedefs_1 = __webpack_require__(7);
function boot(app, options) {
    var models = app.models();
    var types = ast_1.abstractTypes(models);
    var schema = graphql_tools_1.makeExecutableSchema({
        typeDefs: typedefs_1.generateTypeDefs(types),
        resolvers: resolvers_1.resolvers(models),
        resolverValidationOptions: {
            requireResolversForAllFields: false,
        },
    });
    var graphiqlPath = options.graphiqlPath || '/graphiql';
    var path = options.path || '/graphql';
    app.use(path, bodyParser.json(), graphql_server_express_1.graphqlExpress(function (req) {
        return {
            schema: schema,
            context: req,
        };
    }));
    app.use(graphiqlPath, graphql_server_express_1.graphiqlExpress({
        endpointURL: path,
    }));
}
exports.boot = boot;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(0);
var utils_1 = __webpack_require__(1);
var execution_1 = __webpack_require__(2);
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
        //type is a union
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
            }; // creating a new type
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
/*
function generateReturns(name, props) {
    if (_.isObject(props)) {
        props = [props];
    }
    let args;
    args = _.map(props, prop => {
        if (_.isArray(prop.type)) {
            return `${prop.arg}: [${toType(prop.type[0])}]${prop.required ? '!' : ''}`;
        } else if (toType(prop.type)) {
            return `${prop.arg}: ${toType(prop.type)}${prop.required ? '!' : ''}`;
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
        return propType ? `${prop.arg}: [${toType(prop.type[0])}]${prop.required ? '!' : ''}` : '';
    }).join(' \n ');
    return ret ? `(${ret})` : '';

}
*/
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
    // _.each(model.sharedClass.methods, method => {
    //     if (method.accessType !== 'READ' && method.http.path) {
    //         let methodName = methodName(method, model);
    //         types.Mutation.fields[methodName] = {
    //             gqlType: `${generateReturns(method.name, method.returns)}`,
    //             args: `${generateAccepts(method.name, method.accepts)}`
    //         }
    //         return `${methodName(method)}
    //                     ${generateAccepts(method.name, method.accepts)}
    //                 : JSON`;
    //     } else {
    //         return undefined;
    //     }
    // });
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
    //building all models types & relationships
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


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var boot_1 = __webpack_require__(3);
module.exports = boot_1.boot;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(0);
var utils = __webpack_require__(1);
var execution = __webpack_require__(2);
var GraphQLJSON = __webpack_require__(13);
var GraphQLDate = __webpack_require__(9);
var graphql_geojson_1 = __webpack_require__(10);
var scalarResolvers = {
    JSON: GraphQLJSON,
    Date: GraphQLDate,
    GeoPoint: graphql_geojson_1.CoordinatesScalar,
};
function RelationResolver(model) {
    var resolver = {};
    _.forEach(utils.sharedRelations(model), function (rel) {
        resolver[rel.name] = function (obj, args, context) {
            return execution.findRelated(rel, obj, args, context);
        };
    });
    return _a = {},
        _a[utils.singularModelName(model)] = resolver,
        _a;
    var _a;
}
function rootResolver(model) {
    return {
        Query: (_a = {},
            _a["" + utils.pluralModelName(model)] = function (root, args, context) {
                return execution.findAll(model, root, args, context);
            },
            _a["" + utils.singularModelName(model)] = function (obj, args, context) {
                return execution.findOne(model, obj, args, context);
            },
            _a),
        Mutation: (_b = {},
            _b["save" + utils.singularModelName(model)] = function (context, args) {
                return model.upsert(args.obj);
            },
            _b["delete" + utils.singularModelName(model)] = function (context, args) {
                return model.findById(args.id)
                    .then(function (instance) {
                    return instance ? instance.destroy() : null;
                });
            },
            _b),
    };
    var _a, _b;
}
function connectionResolver(model) {
    return _a = {},
        _a[utils.connectionTypeName(model)] = (_b = {
                totalCount: function (obj, args, context) {
                    return obj.count;
                },
                edges: function (obj, args, context) {
                    return _.map(obj.list, function (node) {
                        return {
                            cursor: utils.idToCursor(node[model.getIdName()]),
                            node: node,
                        };
                    });
                }
            },
            _b[model.pluralModelName] = function (obj, args, context) {
                return obj.list;
            },
            _b.pageInfo = function (obj, args, context) {
                var pageInfo = {
                    startCursor: null,
                    endCursor: null,
                    hasPreviousPage: false,
                    hasNextPage: false,
                };
                if (obj.count > 0) {
                    pageInfo.startCursor = utils.idToCursor(obj.list[0][model.getIdName()]);
                    pageInfo.endCursor = utils.idToCursor(obj.list[obj.list.length - 1][model.getIdName()]);
                    pageInfo.hasNextPage = obj.list.length === obj.args.limit;
                    pageInfo.hasPreviousPage = obj.list[0][model.getIdName()] !== obj.first[model.getIdName()].toString();
                }
                return pageInfo;
            },
            _b),
        _a;
    var _a, _b;
}
function remoteResolver(model) {
    var mutation = {};
    //model.sharedClass.methods
    if (model.sharedClass && model.sharedClass.methods) {
        model.sharedClass._methods.map(function (method) {
            if (method.accessType !== 'READ' && method.http.path) {
                var acceptingParams_1 = [];
                method.accepts.map(function (param) {
                    if (param.arg) {
                        acceptingParams_1.push(param.arg);
                    }
                });
                mutation["" + utils.methodName(method, model)] = function (context, args) {
                    var params = [];
                    _.each(method.accepts, function (el, i) {
                        params[i] = args[el.arg];
                    });
                    return model[method.name].apply(model, params);
                };
            }
        });
    }
    return {
        Mutation: mutation,
    };
}
/**
 * Generate resolvers for all models
 *
 * @param {Object} models: All loopback Models
 * @returns {Object} resolvers functions for all models - queries and mutations
 */
function resolvers(models) {
    return _.reduce(models, function (obj, model) {
        if (model.shared) {
            return _.merge(obj, rootResolver(model), connectionResolver(model), RelationResolver(model), remoteResolver(model));
        }
        return obj;
    }, scalarResolvers);
}
exports.resolvers = resolvers;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(0);
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


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("graphql-date");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("graphql-geojson");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("graphql-server-express");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("graphql-tools");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("graphql-type-json");

/***/ })
/******/ ]);
//# sourceMappingURL=index.js_map