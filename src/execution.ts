import * as _ from 'lodash';

import {
  getId,
  connectionTypeName,
  idToCursor,
} from './utils';

function buildSelector(model, args) {
  let selector = {
    where: args.where || {},
    skip: undefined,
    limit: undefined,
    order: undefined,
  };
  const begin = getId(args.after);
  const end = getId(args.before);

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
  let id = obj ? obj[model.getIdName()] : args.id;
  return model.findById(id);
}

function getCount(model, obj, args, context) {
  return model.count(args.where);
}

function getFirst(model, obj, args) {
  return model.findOne({
    order: model.getIdName() + (args.before ? ' DESC' : ' ASC'),
    where: args.where,
  })
    .then(res => {
      return res ? res.__data : {};
    });
}

function getList(model, obj, args) {
  return model.find(buildSelector(model, args));
}

function findAll(model: any, obj: any, args: any, context: any) {
  const response = {
    args: args,
    count: undefined,
    first: undefined,
    list: undefined,
  };
  return getCount(model, obj, args, undefined)
    .then(count => {
      response.count = count;
      return getFirst(model, obj, args);
    })
    .then(first => {
      response.first = first;
      return getList(model, obj, args);
    })
    .then(list => {
      response.list = list;
      return response;
    });
}

function findRelated(rel, obj, args, context) {
  if (_.isArray(obj[rel.keyFrom])) {
    return [];
  }
  args.where = {
    [rel.keyTo]: obj[rel.keyFrom],
  };
  return findAll(rel.modelTo, obj, args, context);

}

function resolveConnection(model) {
  return {
    [connectionTypeName(model)]: {
      totalCount: (obj, args, context) => {
        return obj.count;
      },

      edges: (obj, args, context) => {
        return _.map(obj.list, node => {
          return {
            cursor: idToCursor(node[model.getIdName()]),
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
          pageInfo.startCursor = idToCursor(obj.list[0][model.getIdName()]);
          pageInfo.endCursor = idToCursor(obj.list[obj.list.length - 1][model.getIdName()]);
          pageInfo.hasNextPage = obj.list.length === obj.args.limit;
          pageInfo.hasPreviousPage = obj.list[0][model.getIdName()] !== obj.first[model.getIdName()].toString();
        }
        return pageInfo;
      },
    },
  };
}

export {
  findAll,
  findOne,
  findRelated,
  resolveConnection,
};
