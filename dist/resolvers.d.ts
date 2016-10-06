declare let modelResolvers: {
    generateResolvers: (models: any) => {
        Date: {
            __parseValue(value: any): Date;
            __serialize(value: any): any;
            __parseLiteral(ast: any): number;
        };
    } & {
        Query: {};
    } & {};
};
export default modelResolvers;
