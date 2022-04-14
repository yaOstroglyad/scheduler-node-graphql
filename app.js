const express = require('express');
const bodyParser = require('body-parser');
const {buildSchema} = require('graphql');
const {graphqlHTTP} = require("express-graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");
const User = require("./models/user");
const bcrypt = require("bcryptjs")

const app = express();

app.use(bodyParser.json());

const events = (eventIds) => {
  return Event
      .find({_id: {$in: eventIds}})
      .then(events => {
          events.map(event => {
              return {
                  ...event._doc,
                  _id: event.id,
                  owner: user.bind(this, event.owner)
              }
          });
      })
      .catch(err => {
          throw err;
      })
}

const user = userId => {
    return User.findById(userId)
        .then(user => {
            return {
                ...user._doc,
                _id: user.id,
                createdEvents: events.bind(this, user._doc.createdEvents)
            }
        })
        .catch(err => {
            throw err;
        })
}

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            owner: User!
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
            ownerId: String!
        }
        
        type User {
            _id: ID!
            email: String!
            username: String
            password: String
            createdDate: String!
            createdEvents: [Event!]
        }
        
        input UserInput {
            email: String!
            username: String
            password: String!
            createdDate: String!
        }
        
        type RootQuery {
            events: [Event!]!
            users: [User!]!
        }
        
        type RootMutation {
            createEvent(event: EventInput): Event
            createUser(user: UserInput): User
        }
        
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event
                .find()
                .then(events => {
                    return events.map(event => {
                        // mongoose able option to use event.id instead event._doc._id.toString()
                        return {
                            ...event._doc,
                            _id: event.id,
                            date: new Date(event._doc.date).toISOString(),
                            owner: user.bind(this, event._doc.owner)
                        }
                    })
                })
                .catch(err => {
                    throw err
                })
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.event.title,
                description: args.event.description,
                price: +args.event.price,
                date: new Date(args.event.date),
                owner: args.event.ownerId
            })

            let createdEvent;

            return event
                .save()
                .then(result => {
                    createdEvent = {
                        ...result._doc,
                        _id: result._doc._id.toString(),
                        date: new Date(result._doc.date).toISOString(),
                        owner: user.bind(this, result._doc.owner)
                    }
                    return User.findById(result._doc.owner)
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found.')
                    }
                    user.createdEvents.push(event);
                    return user.save();
                })
                .then(result => {
                    return createdEvent;
                })
                .catch(err => {
                    console.log('error', err)
                    throw err;
                });
        },
        users: () => {
            return User
                .find()
                .then(users => {
                    return users.map(user => {
                        return {
                            ...user._doc,
                            _id: user.id
                        }
                    })
                })
                .catch(err => {
                    throw err;
                })
        },
        createUser: (args) => {
            return User.findOne({email: args.user.email})
                .then(user => {
                    if (user) {
                        throw new Error("User exists already.")
                    }
                    return bcrypt.hash(args.user.password, 12)
                })
                .then(hashedPassword => {
                    const user = new User({
                        email: args.user.email,
                        password: hashedPassword,
                        createdDate: new Date().toISOString()
                    })
                    return user.save();
                })
                .then(result => {
                    return {
                        ...result._doc,
                        password: null,
                        _id: result.id
                    }
                })
                .catch(err => {
                    throw err;
                })
        },
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@scheduler-mongodb.m9jv2.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000);
    }).catch(err => {
        console.log('error', err);
    })
