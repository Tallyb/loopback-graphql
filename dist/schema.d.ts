declare let modelSchema: {
    generateEnums: (models: any) => string;
    generateQueries: (models: any) => string;
    generateTypeDefs: (models: any) => string;
};
export default modelSchema;
