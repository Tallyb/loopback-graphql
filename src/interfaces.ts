//export declare function Model(arg?: { hooks?: {}, remotes?: {} }): any;

export interface IProperty {
  type: any;
  deprecated?: Boolean;
  required?: Boolean;
  defaultFn?: any;
  enum?: any;
}

export interface IField {
  list?: Boolean;
  scalar?: Boolean;
  required?: Boolean;
  gqlType: string;
  relation?: any;
  args?: any;
}

export interface ITypesHash {
  [id: string]: any;
}

export interface ISchemaType {
  category: string;
  fields: IField[];
  input: any;
  values: any;
}
