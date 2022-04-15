const usersResolver = require("./users");
const bookingResolver = require("./booking");
const eventsResolver = require("./events");

const rootResolver = {
    ...usersResolver,
    ...bookingResolver,
    ...eventsResolver
}

module.exports = rootResolver;
