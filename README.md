# GraphQL Server for Loopback

Combine the powers of Apollo Server GraphQL with the backend of Loopback.
All of Loopback models are exposed as GraphQL Queries.
You can use all of Loopback capabilties to define models and rest APIs.
You can use the Apollo Server and Client.

## Getting started

```sh
npm install apollo-loopback
```
In a boot scripts add the following:
```
module.exports = function (app) {
    require('../graphql/boot.js')(app);
};
```
