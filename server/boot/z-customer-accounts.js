// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-relations
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

var async = require('async');

module.exports = function(app, cb) {
    var Customer = app.models.Customer;
    var accounts = [{
        name: 'Checking',
        balance: 5000
    }, {
        name: 'Saving',
        balance: 2000
    }];
    Customer.create({
        name: 'Mary Smith'
    }, function(err, customer) {
        async.each(accounts, function(account, done) {
            customer.accounts.create(account, done);
        }, function(err) {
            customer.accounts(console.log);
            cb(err);
        });
    });
};
