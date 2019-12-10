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

    date: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('User', userSchema)