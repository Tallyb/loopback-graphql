
### Status
[![Build Status](https://travis-ci.org/Tallyb/loopback-graphql.svg?branch=master)](https://travis-ci.org/Tallyb/loopback-graphql)

# GraphQL Server for Loopback (Apollo Server)

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
Add the loopback-graphql component to the `server/component-config.json`: 

```
"loopback-graphql": {
    "path": "/graphql",
    "graphiqlPath":"/graphiql"
  }
```

Requests will be posted to `path` path. (Default: `/graphql`);

Graphiql is available on `graphiqlPath` path. (Default: `/graphiql`);
