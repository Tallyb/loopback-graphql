declare function findOne(model: any, obj: any, args: any, context: any): any;
declare function findAll(model: any, obj: any, args: any, context: any): any;
declare function findRelated(rel: any, obj: any, args: any, context: any): any;
declare function resolveConnection(model: any): {
    [x: string]: {
        [x: number]: (obj: any, args: any, context: any) => any;
        totalCount: (obj: any, args: any, context: any) => any;
        edges: (obj: any, args: any, context: any) => {
            cursor: string;
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
export { findAll, findOne, findRelated, resolveConnection };
