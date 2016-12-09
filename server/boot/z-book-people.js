// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-relations
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

var async = require('async');

module.exports = function(app, cb) {
    var Book = app.models.Book;
    var Author = app.models.Author;
    var Reader = app.models.Reader;

    var author;
    var reader;
    async.series([
        function createAuthor(done) {
            Author.create({
                name: 'Author 1'
            }, function(err, people) {
                author = people;
                done(err, people);
            });
        },
        function createReader(done) {
            Reader.create({
                name: 'Reader 1'
            }, function(err, people) {
                reader = people;
                done(err, people);
            });
        },
        function createBook(done) {
            Book.create({
                name: 'Book 1'
            }, function(err, book) {
                var link1 = book.people.build({
                    notes: 'Note 1'
                });
                link1.linked(author);
                var link2 = book.people.build({
                    notes: 'Note 2'
                });
                link2.linked(reader);
                console.log('Book:', book);
                book.save(done);
            });
        }
    ], function(err) {
        console.log('done');
        cb(err);
    });
};
