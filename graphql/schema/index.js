const {buildSchema} = require("graphql");

module.exports = buildSchema(`
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
`)
