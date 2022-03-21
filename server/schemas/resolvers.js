//import User and Book models
const { User, Book } = require('../models');
//import auth err from appollo
const { AuthenticationError } = require('apollo-server-express');
//import hte token from auth utilities
const { signToken } = require('../utils/auth');

//define my queries and mutations as an onject called resolvers
const resolvers = {
    //First is a Query "me" which returns a user
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id})
                .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Not Logged In maaaaaan')
        }
    },
//next is mutations for add user, login, save a book, remove a book all will be user focused
    Mutation: {
        //add user mutation
        addUser: async(parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return {token,user};
        },

        //login mutation. will need to check username and password against the db
        login: async(parent, {email, password}) => {
            //declare a user variable where find one users email from args
            const user = await User.findOne({email})
            //if there is no user, advise of incorrect credentials
            if(!user) {
                throw new AuthenticationError('Email does not exist in DB');
            }
            //declare variable for storing matched password
            const passwordConfirmed = await user.isCorrectPassword(password)
            //if not correct password/confirmed, thow error
            if(!passwordConfirmed) {
                throw new AuthenticationError('Password is incorrect');
            }
            //assuming email and password pass the check, assign a token to user
            const token = signToken(user);
            //return the object of user and token
            return { token, user };

        },

       //save book mutation, return the updatedUser content after saving a book to profile/db
       saveBook: async(parent, { book }, context) => {
           if (context.user) {
               const updatedUser = await User.findOneAndUpdate(
                   {_id: context.user._id},
                   {$addToSet: {savedBooks: book} },
                   { new: true}
               )
               return updatedUser
           }
           //error if not logged in
           throw new AuthenticationError('You need to be logged in to do that');
       },

       //removing a book, and return the updated user
       removeBook: async(parent, {bookId}, context) => {
           if(context.user) {
               const updatedUser = await User.findOneAndUpdate(
                   {_id: context.user._id},
                   {$pull: { savedBooks: {bookId: bookId}}},
                   {new: true}
               )
               return updatedUser;
           }
       }
       
       
    }
};

module.exports = resolvers;
