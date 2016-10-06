# GraphQL Server for Loopback

Combine the powers of [ApolloStack](http://www.apollostack.com/) GraphQL with the backend of Loopback.
<br>
All of Loopback models are exposed as GraphQL Queries.
<br>
Define models in Loopback to be exposed as REST APIs and GraphQL queries and mutations *.
<br>
Use the Apollo [clients](http://dev.apollodata.com/) to access your data. 

*Mutations are not yet implemented

## Getting started

```sh
npm install loopback-graphql
```
In a loopback [boot script](http://loopback.io/doc/en/lb2/Defining-boot-scripts.html) (e.g. `graphql.js') add the following:
```
module.exports = function (app) {
    require('loopback-graphql').boot(app);
};
```

You can see the loopback explorer on: `http://localhost:3000/explorer`

You can see the graphiql on `http://localhost:3000/graphiql`
