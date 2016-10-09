'use strict';

var _ = require('lodash');
var helper = require('./helper');

function generateInputs(models){
    return _.map(models, m => {
        return `
        input ${m.modelName}Input {
            ${helper.propsTypes(m)}
        } 
        `;
    }).join('\n');
}

//generate Save schema
function generateSaves(models) {
    return _.map(models, m => {
        return `
            save${_.capitalize(m.modelName)} (obj: ${m.modelName}Input!) : ${m.modelName}
        `;
    }).join('\n');
}

module.exports = {
    generateInputs,
    generateSaves
};