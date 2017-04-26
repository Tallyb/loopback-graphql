declare var _default: {
    findAll: (model: any, obj: any, args: any, context: any) => any;
    findOne: (model: any, obj: any, args: any, context: any) => any;
    findRelated: (rel: any, obj: any, args: any, context: any) => any;
    resolveConnection: (model: any, obj: any, args: any, context: any) => {
        [x: number]: {
            [x: number]: (obj: any, args: any, context: any) => any;
            totalCount: (obj: any, args: any, context: any) => any;
            edges: (obj: any, args: any, context: any) => {
                cursor: any;
                node: {};
            }[];
            pageInfo: (obj: any, args: any, context: any) => {
                startCursor: any;
                endCursor: any;
                hasPreviousPage: boolean;
                hasNextPage: boolean;
            };
        };
    };
};
export default _default;
