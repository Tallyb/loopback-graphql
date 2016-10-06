'use strict';
const lodash_1 = require('lodash');
const index_js_1 = require('graphql/language/index.js');
const typeResolvers = {
    Date: {
        __parseValue(value) {
            return new Date(value);
        },
        __serialize(value) {
            return value.getTime();
        },
        __parseLiteral(ast) {
            if (ast.kind === index_js_1.Kind.INT) {
                return parseInt(ast.value, 10);
            }
            return null;
        }
    }
};
function generateRootResolvers(models) {
    let resolvers = {};
    lodash_1.default.forEach(models, m => {
        resolvers[m.pluralModelName] = (obj, args, context) => {
            console.log('CONTEXT', context);
            console.log('ARGS', args);
            return m.find(args).then(res => {
                return res;
            });
        };
    });
    lodash_1.default.forEach(models, m => {
        resolvers[m.modelName] = (obj, args, context) => {
            console.log('CONTEXT', context);
            console.log('ARGS', args);
            return m.findOne(args).then(res => {
                return res;
            });
        };
    });
    return { Query: resolvers };
}
function generateModelResolvers(models) {
    let resolvers = {};
    lodash_1.default.forEach(models, m => {
        resolvers[m.modelName] = (obj, args, context) => {
            return m.findById(obj.id);
        };
        let resolver = {};
        lodash_1.default.forEach(m.relations, r => {
            resolver[r.name] = (obj, args, context) => {
                let query = {};
                query[r.keyTo] = obj[r.keyFrom];
                return r.modelTo.find({ where: query }).then(res => {
                    return res;
                });
            };
        });
        resolvers[m.modelName] = resolver;
    });
    return resolvers;
}
function generateResolvers(models) {
    return lodash_1.default.merge(typeResolvers, generateRootResolvers(models), generateModelResolvers(models));
}
let modelResolvers = {
    generateResolvers
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = modelResolvers;
//# sourceMappingURL=resolvers.js.map