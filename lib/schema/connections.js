'use strict';

var _ = require('lodash');
var utils = require('./utils');

function typeDefs(models) { // connection and edges type name
    return _.map(models, model => {
        return `
            type ${utils.connectionTypeName(model)} {
                pageInfo: PageInfo!
                edges: [${utils.edgeTypeName(model)}]
                totalCount: Int
                ${model.pluralModelName}: [${model.modelName}]
            }
            type ${utils.edgeTypeName(model)} {
                node: ${model.modelName}
                cursor: String!
            }
        `;
    });
}

// obj is recieving the data from the query get list.
// this function returns the resolver for the modelConnection, e.g. UserConnection as follow
// { UserConnection: {
//      PageInfo:   returns information about the pagination page
//      edges:  returns the edges with cursors
//      totalCount: return the count of all the result
//      Users: returns users with no pagination
// }}
function resolver(model, obj, args, context) {
    return {
        [utils.connectionTypeName(model)]: {
            totalCount: (obj, args, context) => {
                return obj.count;
            },

            edges: (obj, args, context) => {
                return _.map(obj.list, node => {
                    return {
                        cursor: utils.idToCursor(node[model.getIdName()]),
                        node: node
                    };
                });
            },

            [model.pluralModelName]: (obj, args, context) => {
                return obj.list;
            },

            pageInfo: (obj, args, context) => {
                let pageInfo = {
                    startCursor: null,
                    endCursor: null,
                    hasPreviousPage: false,
                    hasNextPage: false
                };
                if (obj.count > 0) {
                    pageInfo.startCursor = utils.idToCursor(obj.list[0][model.getIdName()]);
                    pageInfo.endCursor = utils.idToCursor(obj.list[obj.list.length - 1][model.getIdName()]);
                    pageInfo.hasNextPage = obj.list.length === obj.args.limit;
                    pageInfo.hasPreviousPage = obj.list[0][model.getIdName()] !== obj.first[model.getIdName()].toString();
                }
                return pageInfo;
            }
        }
    };
}

module.exports = {
    typeDefs,
    resolver
};