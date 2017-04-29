//export declare function Model(arg?: { hooks?: {}, remotes?: {} }): any;

export interface Property {
  type: any;
  deprecated?: Boolean;
  required?: Boolean;
  defaultFn?: any;
  enum?: any;
}

export interface Field {
  list?: Boolean;
  scalar?: Boolean;
  required?: Boolean;
  gqlType: string;
  relation?: any;
  args?: any;
}

export interface TypesHash {
  [id: string]: any;
};

export interface SchemaType {
  category: string;
  fields: Field[];
  input: any;
  values: any;
};
