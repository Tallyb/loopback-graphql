
# Deprecation Warning: 
I have been very bad at maintaining this repo, and do not see how I come back to it in the near future.
I have seen that this repo is a fork that moved forward: https://github.com/yahoohung/loopback-graphql-server/. 
If anyone is willing to take maintaining this repo on themselves - you are welcome. 
Thanks for all the feedback... 

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

![Loopback Graphql](./resources/loopback-graphql.png?raw=true "LoopBack Apollo Architecture") 

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

## Usage

Access the Graphiql interface to view your GraphQL model onthe Docs section. 
Build the GraphQL queries and use them in your application.

geoPoint objects are supported as follow: 
```
{"newNote": 
  {
    "location": {"lat":40.77492964101182, "lng":-73.90950187151662}
  }
}
```

## Roadmap
[See here the Github project](https://github.com/Tallyb/loopback-graphql/projects/1)
