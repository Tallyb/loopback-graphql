'use strict';

var _ = require('lodash');
var helper = require('./helper');

//input MMMMMInput
//mutation SaveMMMMM (MMMMM:MMMMMInput) {
// MMMMM: MMMMM
//}

function mapModel(model) {
    return `
        input ${model.modelName}Input {
            ${helper.mapProps(model)}
        }    
    `;
}

//generate Save schema
function generateSaves(models) {
    return _.map(models, m => {
        return mapModel(m);
    }).join('\n');
}

module.exports = {
    generateSaves
};