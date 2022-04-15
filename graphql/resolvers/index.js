const authResolver = require("./auth");
const usersResolver = require("./users");
const bookingResolver = require("./booking");
const eventsResolver = require("./events");

const rootResolver = {
    ...authResolver,
    ...usersResolver,
    ...bookingResolver,
    ...eventsResolver
}

module.exports = rootResolver;
