const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const getEventsByIds = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                owner: getUserById.bind(this, event.owner)
            };
        });
        return events;
    } catch (err) {
        throw err;
    }
};

const getUserById = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            _id: user.id,
            createdDate: new Date(user._doc.createdDate).toISOString(),
            createdEvents: getEventsByIds.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    owner: getUserById.bind(this, event._doc.owner)
                };
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async args => {
        const event = new Event({
            title: args.event.title,
            description: args.event.description,
            price: +args.event.price,
            date: new Date(args.event.date),
            owner: args.event.ownerId
        });
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                owner: getUserById.bind(this, result._doc.owner)
            };
            const owner = await User.findById(result._doc.owner);

            if (!owner) {
                throw new Error('User not found.');
            }
            owner.createdEvents.push(event);
            await owner.save();

            return createdEvent;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    users: async () => {
        try {
            const users = await User.find();
            return users.map(user => {
                return {
                    ...user._doc,
                    _id: user.id,
                    createdDate: new Date(user._doc.createdDate).toISOString(),
                    createdEvents: getEventsByIds.bind(this, user._doc.createdEvents)
                };
            });
        } catch (err) {
            throw err;
        }
    },
    createUser: async args => {
        try {
            const existingUser = await User.findOne({ email: args.user.email });
            if (existingUser) {
                throw new Error('User exists already.');
            }
            const hashedPassword = await bcrypt.hash(args.user.password, 12);

            const user = new User({
                email: args.user.email,
                password: hashedPassword,
                date: new Date().toISOString()
            });

            const result = await user.save();

            return { ...result._doc, password: null, _id: result.id };
        } catch (err) {
            throw err;
        }
    }
};
