'use strict';
var server = require('../server/server');
var expect = require('chai').expect;
describe('model testing', () => {
    it.skip('should return models', (done) => {
        server.on('started', function() {
            console.log('SERVER STARTED');
            expect(server).not.to.be.empty;
            done();
        });
    });
});
