import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userInfoSchema = new Schema({
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
})

export { userInfoSchema }