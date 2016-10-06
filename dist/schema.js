'use strict';
const lodash_1 = require('lodash');
const mapEnums = (model) => {
    return lodash_1.default.map(model.definition.properties, (p, key) => {
        return p.enum ? `enum ${key} { ${p.enum.join('\n ')} }` : '';
    });
};
function generateEnums(models) {
    return lodash_1.default.map(models, m => {
        return mapEnums(m);
    }).join('\n');
}
const mapModel = (model) => {
    const typesMapping = {
        Number: 'Float',
        String: 'String',
        Boolean: 'Boolean',
        ObjectID: 'ID',
        Date: 'Date'
    };
    let props = lodash_1.default.map(model.definition.properties, (p, key) => {
        let req = p.required ? '!' : '';
        let type = p.enum ? key : typesMapping[p.type.name];
        return !p.deprecated ? `${key}: ${type}${req} ` : '';
    });
    let rels = lodash_1.default.map(model.relations, (r, key) => {
        let i = r.multiple ? `${r.name}: [${r.modelTo.modelName}]` : `${r.name}: ${r.modelTo.modelName}`;
        return i;
    });
    return `type ${model.modelName} {
         ${props.join('\n ')}
         ${rels.join('\n ')}
        }`;
};
function generateTypeDefs(models) {
    return lodash_1.default.map(models, m => {
        return mapModel(m);
    }).join('\n');
}
function generateQueries(models) {
    return lodash_1.default.map(models, m => {
        return `
            ${m.pluralModelName}: [${m.modelName}]
            ${m.modelName}: ${m.modelName}
        `;
    }).join('\n');
}
let modelSchema = {
    generateEnums,
    generateQueries,
    generateTypeDefs
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = modelSchema;
//# sourceMappingURL=schema.js.map