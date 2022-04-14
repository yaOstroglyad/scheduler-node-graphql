const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

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

const getEventById = async (eventId) => {
  try {
      const event = await Event.findById(eventId);
      return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          owner: getUserById.bind(this, event.owner)
      }
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
            createdAt: new Date(user._doc.createdAt).toISOString(),
            createdEvents: getEventsByIds.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
};

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    event: getEventById.bind(this, booking._doc.event),
                    user: getUserById.bind(this, booking._doc.user),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async args => {
        try {
            const fetchedEvent = await Event.findOne({_id: args.eventId})
            const fetchedUser = await User.findOne({_id: args.userId})
            const booking = new Booking({
                user: fetchedUser,
                event: fetchedEvent
            });
            const result = await booking.save();
            return {
                ...result._doc,
                _id: result.id,
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString()
            }
        } catch (err) {
            throw err
        }
    },
    cancelBooking: async args => {
        try {
            const fetchedBooking = await Booking.findOne({_id: args.bookingId})
            const booking = new Booking({
                user: args.booking.userId,
                event: fetchedEvent
            });
            const result = await booking.save()
            return {
                ...result._doc,
                _id: result.id,
                createdAt: new Date(booking._doc.createdAt).toISOString(),
                updatedAt: new Date(booking._doc.updatedAt).toISOString()
            }
        } catch (err) {
            throw err
        }
    },
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
                    createdAt: new Date(user._doc.createdAt).toISOString(),
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
