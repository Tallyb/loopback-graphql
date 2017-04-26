declare var _default: {
    PAGINATION: string;
    getId: (cursor: any) => string;
    idToCursor: (id: any) => string;
    cursorToId: (cursor: any) => string;
    connectionTypeName: (model: any) => string;
    edgeTypeName: (model: any) => string;
    singularModelName: (model: any) => any;
    methodName: (method: any, model: any) => string;
    pluralModelName: (model: any) => string;
    sharedRelations: (model: any) => {};
    sharedModels: (models: any) => {}[];
};
export default _default;
