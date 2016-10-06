'use strict';

var _ = require('lodash');

//input MMMMMInput
//mutation SaveMMMMM (MMMMM:MMMMMInput) {
// MMMMM: MMMMM
//}

function mapModel(model) {
    var props = map
    return model.modelName;
}

//generate POST schema
function generateSaves(models) {
    return _.map(models, m => {
        return mapModel(m);
    }).join('\n');
}

module.exports = {
    generateSaves
};