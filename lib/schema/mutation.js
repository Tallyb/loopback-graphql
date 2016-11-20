'use strict';
var _ = require('lodash');

function modelName(model) {
    return _.upperFirst(model.modelName);
}

function typeDefs(model) {
    return `
        save${modelName(model)} (obj: ${model.modelName}Input!) : ${model.modelName}
        delete${modelName(model)} (id: ID!) : String
    `;
}

function resolvers(model) {
    return {
        Mutation: {
            [`save${modelName(model)}`]: (context, args) => model.upsert(args.obj),
            [`delete${modelName(model)}`]: (context, args) => {
                return model.findById(args.id)
                    .then(instance => instance.destroy());
            }
        }
    };
}

module.exports = {
    typeDefs,
    resolvers
};