const Event = require('../../models/event');
const User = require("../../models/user");
const {transformEvent} = require('./shared/merge');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
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
            createdEvent = transformEvent(result);
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
    }
};
