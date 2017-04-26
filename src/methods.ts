import * as _ from 'lodash';
import * as untils from './utils';

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

export default function generateMethods(model) {
  return _.chain(model.sharedClass.methods())
    .map(method => {
      if (method.accessType === 'WRITE' && method.http.path) {
        return `${utils.methodName(method)}
                        ${generateAccepts(method.name, method.accepts)}
                        ${generateReturns(method.name, method.returns)}
                    : JSON`;
      } else {
        return undefined;
      }
    })
    .compact()
    .value()
    .join(' \n ');
}
