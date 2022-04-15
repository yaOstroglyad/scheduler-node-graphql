const Event = require("../../../models/event");
const User = require("../../../models/user");
const {dateToString} = require("../../../utils/date");

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
        event: getEventById.bind(this, booking._doc.event),
        user: getUserById.bind(this, booking._doc.user),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
}

const getEventsByIds = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});
        return events.map(event => {
            return transformEvent(event)
        });
    } catch (err) {
        throw err;
    }
};

const getEventById = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (err) {
        throw err;
    }
}

const getUserById = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            _id: user.id,
            createdAt: dateToString(user._doc.createdAt),
            createdEvents: getEventsByIds.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
};


exports.getEventsByIds = getEventsByIds;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
