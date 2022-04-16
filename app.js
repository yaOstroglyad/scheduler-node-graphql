const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require("express-graphql");
const mongoose = require("mongoose");

const graphqlSchema = require('./graphql/schema/index')
const graphqlResolvers = require('./graphql/resolvers/index')
const isAuth = require('./middleware/is-auth')

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
      return res.sendStatus(200);
  }
  next();
})

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@scheduler-mongodb.m9jv2.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000);
    }).catch(err => {
        console.log('error', err);
    })
