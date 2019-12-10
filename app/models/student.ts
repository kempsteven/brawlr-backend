import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const StudentSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    school: {
        type: String,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },
})