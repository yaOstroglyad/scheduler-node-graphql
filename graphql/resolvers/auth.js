const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {entityNotExistException} = require("../../utils/entityNotExistException");
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    login: async ({email, password}) => {
        try {
            const user = await User.findOne({email: email});

            entityNotExistException('User', user);

            const isPasswordEqual = await bcrypt.compare(password, user.password);

            if(!isPasswordEqual) {
                console.error('Password is incorrect!', `${password}, ${user.password}`)
                throw new Error('Password is incorrect!');
            }

            const token = jwt.sign(
                {userId: user.id, email: user.email},
                'abrakadabrasecretkey',
                {expiresIn: '2h'}
            )
            return { userId: user.id, token: token, tokenExpiration: 2}
        } catch (err) {
            throw err;
        }
    },
    resetPassword: async ({userId, oldPassword, newPassword}) => {
        let user = undefined;

        if (ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        } else {
            throw new Error("Wrong userId")
        }

        entityNotExistException('User', user);

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isOldPasswordValid) {
            console.error(`Old password is incorrect! 
            oldPassword: ${oldPassword}, 
            user.password: ${user.password}`)
            throw new Error('Old password is incorrect!');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        const result = await User.findOneAndUpdate({
            ...user._doc,
            password: hashedNewPassword
        });

        return {...result._doc, password: null, _id: result.id};
    }
};
