const User = require("../../models/user");
const {dateToString} = require("../../utils/date");
const bcrypt = require("bcryptjs");
const {getEventsByIds} = require("./shared/merge")

module.exports = {
    users: async () => {
        try {
            const users = await User.find();
            return users.map(user => {
                return {
                    ...user._doc,
                    _id: user.id,
                    createdAt: dateToString(user._doc.createdAt),
                    createdEvents: getEventsByIds.bind(this, user._doc.createdEvents)
                };
            });
        } catch (err) {
            throw err;
        }
    },
    createUser: async args => {
        try {
            const existingUser = await User.findOne({email: args.user.email});
            if (existingUser) {
                throw new Error('User exists already.');
            }
            const hashedPassword = await bcrypt.hash(args.user.password, 12);

            const user = new User({
                email: args.user.email, password: hashedPassword, date: new Date().toISOString()
            });

            const result = await user.save();

            return {...result._doc, password: null, _id: result.id};
        } catch (err) {
            throw err;
        }
    }
};
