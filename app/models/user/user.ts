import { Schema, model, Document } from 'mongoose'

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

    gender: {
        type: Object,
        required: true,
        default: () => {}
    },

    age: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },

    fighterType: {
        type: String,
        min: 2,
        max: 255
    },

    location: {
        type: String,
        min: 2,
        max: 255
    },

    profilePictures: {
        type: Array,
        default: () => []
    },

    genderPreference: {
        type: Array,
        default: () => [0, 1, 2]
    },

    ageRange: {
        type: Array,
        default: () => [1, 100]
    },

    status: {
        type: Number,
        default: 0
    }
}, { timestamps: true })
export interface SavedUserDocument extends Document {
    firstName: string

    lastName: string

    email: string

    password: string

    bio: string

    gender: object

    age: number

    fighterType: string

    location: string

    genderPreference: Array<number>

    ageRange: Array<number>

    status: number
}

export const userModel = model<SavedUserDocument>('User', userSchema)
