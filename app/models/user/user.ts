import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },

    lastName: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },

    email: {
        type: String,
        required: true,
        unique: true,
        min: 6,
        max: 255
    },

    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },

    bio: {
        type: String,
        min: 0,
        max: 255
    },

    age: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },

    fighterType: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },

    location: {
        type: String,
        required: true,
        min: 2,
        max: 1024
    },

    status: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('User', userSchema)