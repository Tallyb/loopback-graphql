'use strict';
global.Promise = require('bluebird');

var apolloClient = require('apollo-client');
var server;

const initClient = function() {
    const networkInterface = apolloClient.createNetworkInterface('/graphql');
    return new apolloClient.default({
        networkInterface
    });
};

const getServer = function() {
    return new Promise(function(resolve, reject) {
        if (server) {
            resolve(server);
            return;
        }
        var serverInstance = require('../server/server.js');
        serverInstance.on('started', function() {
            server = serverInstance;
            console.log('STARTED',serverInstance);

            resolve(server);
            return;
        });
    });
};

module.exports = {
    initClient,
    getServer
};