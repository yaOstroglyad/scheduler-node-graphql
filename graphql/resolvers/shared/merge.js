const Event = require("../../../models/event");
const User = require("../../../models/user");
const {dateToString} = require("../../../utils/date");
const DataLoader = require("dataloader");

const eventLoader = new DataLoader(eventIds => {
    return getEventsByIds(eventIds);
})

const userLoader = new DataLoader(userIds => {
    return User.find({_id: {$in: userIds}});
})

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        owner: getUserById.bind(this, event.owner)
    };
}

const transformBooking = booking => {
    return {
        ...booking._doc,
        _id: booking.id,
        user: getUserById.bind(this, booking._doc.user),
        event: getEventById.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
}

const getEventsByIds = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});
        events.sort((a, b) => {
            return (eventIds.indexOf(a.id.toString()) - eventIds.indexOf(b._id.toString()));
        });
        return events.map(event => {
            return transformEvent(event);
        });
    } catch (err) {
        throw err;
    }
};

const getEventById = async (eventId) => {
    try {
        const event = await eventLoader.load(eventId.toString());
        return event;
    } catch (err) {
        throw err;
    }
}

const getUserById = async userId => {
    try {
        const user = await userLoader.load(userId.toString());
        return {
            ...user._doc,
            _id: user.id,
            createdAt: dateToString(user._doc.createdAt),
            createdEvents: () => eventLoader.loadMany(user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
};


exports.getEventsByIds = getEventsByIds;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
