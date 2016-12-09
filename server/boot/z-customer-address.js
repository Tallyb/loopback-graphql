// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-relations
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

module.exports = function(app) {
    var Customer = app.models.Customer;
    var address = {
        street: '123 A St',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95131'
    };
    Customer.create({
        name: 'John Smith'
    }, function(err, customer) {
        customer.address.create(address, function(err, address) {
                return null;
            });
    });
};
