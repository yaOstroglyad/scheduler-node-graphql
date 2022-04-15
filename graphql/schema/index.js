const {buildSchema} = require("graphql");

module.exports = buildSchema(`
    
    type Booking {
        _id: ID!
        event: Event!
        user: User! 
        createdAt: String!
        updatedAt: String!
    }
    
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
    }
    
    type User {
        _id: ID!
        email: String!
        username: String
        password: String
        createdAt: String!
        updatedAt: String!
        createdEvents: [Event!]
    }
    
    type AuthData {
        userId: ID!
        token: String!
        tokenExpiration: Int!
    }
    
    input UserInput {
        email: String!
        username: String
        password: String!
    }
    
    type RootQuery {
        events: [Event!]!
        users: [User!]!
        bookings: [Booking!]!
        login(email: String!, password: String!): AuthData!
    }
    
    type RootMutation {
        createEvent(event: EventInput): Event
        createUser(user: UserInput): User
        bookEvent(eventId: ID!, userId: ID!): Booking!
        cancelBooking(bookingId: ID!): Event!
        resetPassword(userId: String!, oldPassword: String!, newPassword: String!): User!
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)
