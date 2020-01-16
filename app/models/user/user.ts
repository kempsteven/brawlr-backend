import { Schema, model, Document } from 'mongoose'

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },

    lastName: {
        type: String,
        required: true,
        min: 2,
        max: 50
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
        max: 200,
        default: ''
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
        max: 50,
        default: ''
    },

    location: {
        type: Object,
        default: () => {}
    },

    organization: {
        type: String,
        min: 2,
        max: 50,
        default: ''
    },

    profilePictures: {
        type: Array,
        default: () => [
            { position: 1, image: null },
            { position: 2, image: null },
            { position: 3, image: null },
            { position: 4, image: null },
            { position: 5, image: null },
            { position: 6, image: null },
        ]
    },
    
    genderPreference: {
        type: Object,
        default: () => {
            return {
                male: 1,
                female: 1,
                others: 1,
            }
        }
    },

    ageRange: {
        type: Object,
        default: () => {
            return {
                from: 1,
                to: 100,
            }
        }
    },

    status: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export interface SavedUserDocument extends Document {
    image: any

    firstName: string

    lastName: string

    email: string

    password: string

    bio: string

    gender: object

    age: number

    fighterType: string

    location: object

    profilePictures: Array<{
        position: number,
        
        image: {
            publicId: string,
            url: string
        }
    }>

    genderPreference: Array<number>

    ageRange: Array<number>

    status: number
}

export const userModel = model<SavedUserDocument>('User', userSchema)
