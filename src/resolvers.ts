import * as _ from 'lodash';
import * as utils from './utils';

import * as execution from './execution';
import * as GraphQLJSON from 'graphql-type-json';
import * as GraphQLDate from 'graphql-date';
import {
  CoordinatesScalar,
} from 'graphql-geojson';

const scalarResolvers = {
  JSON: GraphQLJSON,
  Date: GraphQLDate,
  GeoPoint: CoordinatesScalar,
};

function RelationResolver(model) {
  let resolver = {};
  _.forEach(utils.sharedRelations(model), rel => {
    resolver[rel.name] = (obj, args, context) => {
      return execution.findRelated(rel, obj, args, context);
    };
  });

  return {
    [utils.singularModelName(model)]: resolver,
  };
}

function rootResolver(model) {
  return {
    Query: {
      [`${utils.pluralModelName(model)}`]: (root, args, context) => {
        return execution.findAll(model, root, args, context);
      },
      [`${utils.singularModelName(model)}`]: (obj, args, context) => {
        return execution.findOne(model, obj, args, context);
      },
    },
    Mutation: {
      [`save${utils.singularModelName(model)}`]: (context, args) => {
        return model.upsert(args.obj);
      },
      [`delete${utils.singularModelName(model)}`]: (context, args) => {
        return model.findById(args.id)
          .then(instance => {
            return instance ? instance.destroy() : null;
          });
      },
    },
  };
}

function connectionResolver(model: any) {
  return {
    [utils.connectionTypeName(model)]: {
      totalCount: (obj, args, context) => {
        return obj.count;
      },

      edges: (obj, args, context) => {
        return _.map(obj.list, node => {
          return {
            cursor: utils.idToCursor(node[model.getIdName()]),
            node: node,
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
    },
  };
}

function remoteResolver(model) {
  let mutation = {};
  //model.sharedClass.methods
  if (model.sharedClass && model.sharedClass.methods) {
    model.sharedClass._methods.map(function (method) {
      if (method.accessType !== 'READ' && method.http.path) {
        let acceptingParams = [];
        method.accepts.map(function (param) {
          if (param.arg) {
            acceptingParams.push(param.arg);
          }
        });
        mutation[`${utils.methodName(method, model)}`] = (context, args) => {
          let params = [];
          _.each(method.accepts, (el, i) => {
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
export function resolvers(models: any[]) {
  return _.reduce(models, (obj: any, model: any) => {
    if (model.shared) {
      return _.merge(
        obj,
        rootResolver(model),
        connectionResolver(model),
        RelationResolver(model),
        remoteResolver(model),
      );
    }
    return obj;
  }, scalarResolvers);
}
