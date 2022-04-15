const Booking = require("../../models/booking");
const Event = require("../../models/event");
const User = require("../../models/user");
const {transformEvent, transformBooking} = require("./shared/merge");

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
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
                user: fetchedUser, event: fetchedEvent
            });
            const result = await booking.save();
            return transformBooking(result);
        } catch (err) {
            throw err
        }
    },
    cancelBooking: async args => {
        try {
            const fetchedBooking = await Booking.findById(args.bookingId).populate('event')
            const event = transformEvent(fetchedBooking.event)
            await Booking.deleteOne({_id: args.bookingId})
            return event;
        } catch (err) {
            throw err
        }
    },
};
