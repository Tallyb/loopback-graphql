import * as _ from 'lodash';
import { SchemaType, Field, TypesHash } from './interfaces';

const scalarTypes = `
        scalar Date
        scalar JSON
        scalar GeoPoint
        `;

function args(args: string): string {
  return args ? `(${args})` : '';
}

function generateInputField(field: Field, name: string): string {
  return `
        ${name} : ${field.list ? '[' : ''}
        ${field.gqlType}${field.scalar ? '' : 'Input'}${field.required ? '!' : ''} ${field.list ? ']' : ''}`;
}

function generateOutputField(field: Field, name: string): string {
  return `${name} ${args(field.args)} : ${field.list ? '[' : ''}${field.gqlType}${field.required ? '!' : ''} ${field.list ? ']' : ''}`;
}

export function generateTypeDefs(types: TypesHash) {
  const categories = {
    TYPE: (type: SchemaType, name: string) => {
      let output = _.reduce(type.fields, (result: string, field: Field, fieldName: string): string => {
        return result + generateOutputField(field, fieldName) + ' \n ';
      }, '');

      let result = `
                type ${name} {
                    ${output}
                }`;
      if (type.input) {
        let input = _.reduce(type.fields, (accumulator: string, field: Field, fieldName: string) => {
          return !field.relation ? accumulator + generateInputField(field, fieldName) + ' \n ' : accumulator;
        }, '');
        result += `input ${name}Input {
                    ${input}
                }`;
      }
      return result;
    },
    UNION: (type: SchemaType, name: string) => {
      return `union ${name} = ${type.values.join(' | ')}`;
    },
    ENUM: (type: SchemaType, name: string) => {
      return `enum ${name} {${type.values.join(' ')}}`;
    },
  };

  return _.reduce(types, (result: string, type: SchemaType, name: string) => {
    return result + categories[type.category](type, name);
  }, scalarTypes);
}
