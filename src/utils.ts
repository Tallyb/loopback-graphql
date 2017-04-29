import * as _ from 'lodash';

const PAGINATION = '(where: JSON, after: String, first: Int, before: String, last: Int)';

function base64(i) {
  return (new Buffer(i, 'ascii')).toString('base64');
}

function unbase64(i) {
  return (new Buffer(i, 'base64')).toString('ascii');
}

const PREFIX = 'connection.';

/**
 * Creates the cursor string from an offset.
 * @param {String} id the id to convert
 * @returns {String}   an opaque cursor
 */
function idToCursor(id) {
  return base64(PREFIX + id);
}

/**
 * Rederives the offset from the cursor string.
 * @param {String} cursor   the cursor for conversion
 * @returns {String} id   converted id
 */
function cursorToId(cursor) {
  return unbase64(cursor).substring(PREFIX.length);
}

function getId(cursor) {
  if (cursor === undefined || cursor === null) {
    return null;
  }
  return cursorToId(cursor);
}

function connectionTypeName(model) {
  return `${model.modelName}Connection`;
}

function edgeTypeName(model: any) {
  return `${model.modelName}Edge`; // e.g. UserEdge
}

function singularModelName(model) {
  return model.modelName;
}

function pluralModelName(model: any) {
  return 'all' + _.upperFirst(model.pluralModelName);
}

function sharedRelations(model: any) {
  return _.pickBy(model.relations, rel => rel.modelTo && rel.modelTo.shared);
}

function sharedModels(models: any[]) {
  return _.filter(models, model => {
    return model.shared;
  });
}

function methodName(method, model) {
  return model.modelName + _.upperFirst(method.name);
}
export {
  PAGINATION,
  getId,
  idToCursor,
  cursorToId,
  connectionTypeName,
  edgeTypeName,
  singularModelName,
  methodName,
  pluralModelName,
  sharedRelations,
  sharedModels,
};
