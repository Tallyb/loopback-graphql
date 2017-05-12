'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var testHelper_1 = require("./testHelper");
var graphql_tag_1 = require("graphql-tag");
describe('mutation', function () {
    it('should add and Delete single entity', function () {
        var id;
        var createAuthor = (_a = ["\n            mutation save ($obj: AuthorInput!) {\n                saveAuthor (obj: $obj) {\n                    first_name\n                    last_name\n                    birth_date\n                    id\n                }\n           }\n        "], _a.raw = ["\n            mutation save ($obj: AuthorInput!) {\n                saveAuthor (obj: $obj) {\n                    first_name\n                    last_name\n                    birth_date\n                    id\n                }\n           }\n        "], graphql_tag_1.default(_a));
        var authorInput = {
            first_name: 'Virginia',
            last_name: 'Wolf',
            birth_date: new Date(),
        };
        var deleteAuthor = (_b = ["\n            mutation delete ($id: ID!) {\n                deleteAuthor (id: $id) {\n                    text\n                }\n           }\n        "], _b.raw = ["\n            mutation delete ($id: ID!) {\n                deleteAuthor (id: $id) {\n                    text\n                }\n           }\n        "], graphql_tag_1.default(_b));
        return testHelper_1.gqlRequest(createAuthor, {
            obj: authorInput,
        })
            .then(function (res) {
            chai_1.expect(res).to.have.status(200);
            id = res.body.data.saveAuthor.id;
            return testHelper_1.gqlRequest(deleteAuthor, {
                id: id,
            });
        })
            .then(function (res) {
            chai_1.expect(res).to.have.status(200);
        });
        var _a, _b;
    });
    it('should add a single entity with sub type', function () {
        var body = 'Heckelbery Finn';
        var query = (_a = ["\n            mutation save ($obj: NoteInput!) {\n                saveNote (obj: $obj) {\n                    id\n                    title\n                    author {\n                        first_name\n                        last_name\n                    }\n\n                }\n           }\n        "], _a.raw = ["\n            mutation save ($obj: NoteInput!) {\n                saveNote (obj: $obj) {\n                    id\n                    title\n                    author {\n                        first_name\n                        last_name\n                    }\n\n                }\n           }\n        "], graphql_tag_1.default(_a));
        var variables = {
            obj: {
                title: 'Heckelbery Finn',
                content: {
                    body: body,
                    footer: 'The end',
                },
            },
        };
        return testHelper_1.gqlRequest(query, variables)
            .then(function (res) {
            chai_1.expect(res).to.have.status(200);
        });
        var _a;
    });
    describe('remote methods', function () {
        var userInput = {
            email: 'John@a.com',
            password: '123456',
            username: 'John@a.com',
        };
        var createUser = "\n          mutation userCreate ($obj: UserInput!) {\n            saveUser ( obj: $obj ) {\n              id\n            }\n          }\n        ";
        var deleteUser = (_a = ["\n            mutation delete ($id: ID!) {\n                deleteAuthor (id: $id) {\n                    text\n                }\n           }\n        "], _a.raw = ["\n            mutation delete ($id: ID!) {\n                deleteAuthor (id: $id) {\n                    text\n                }\n           }\n        "], graphql_tag_1.default(_a));
        var userId;
        beforeEach(function () {
            return testHelper_1.gqlRequest(createUser, {
                obj: userInput,
            })
                .then(function (res) {
                userId = res.body.data.saveUser.id;
            });
        });
        afterEach(function () {
            return testHelper_1.gqlRequest(deleteUser, {
                id: userId,
            });
        });
        it('should login and return an accessToken', function () {
            var query = (_a = ["\n          mutation login{\n            UserLogin(credentials:{username:\"naveenmeher\", password:\"welcome\"})\n          }\n        "], _a.raw = ["\n          mutation login{\n            UserLogin(credentials:{username:\"naveenmeher\", password:\"welcome\"})\n          }\n        "], graphql_tag_1.default(_a));
            return testHelper_1.gqlRequest(query)
                .then(function (res) {
                chai_1.expect(res).to.have.status(200);
                res.body.data.UserLogin.id.shoule.not.to.be.empty();
            });
            var _a;
        });
        var _a;
    });
});
