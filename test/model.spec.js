'use strict';

//var Promise = require('bluebird');
var server = require('../server/server');

var expect = require('chai').expect;
// var chai = require('chai')
//     .use(require('chai-http'));

// var getServer = function() {
//     return new Promise(function(resolve, reject) {
//         if (server) {
//             resolve(server);
//             return;
//         }
//         var serverInstance = require('../server/server');
//         serverInstance.on('started', function() {
//             console.log('SERVER STARTED');
//             server = serverInstance;
//             resolve(server);
//             return;
//         });
//     });
// };

describe('model testing', () => {

    it.skip('should return models', (done) => {

        server.on('started', function() {
            console.log('SERVER STARTED');
            expect(server).not.to.be.empty;
            done();
        });
        // .then(s => {
        //     console.log('SERVER', s);
        //     expect(s).not.to.be.empty;
        // }).asCallback(done);
    });

});