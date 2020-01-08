import { Schema, model, Document, Types } from 'mongoose'
import { number } from 'joi'

const matchSchema = new Schema({
    challengerId: {
        type: Types.ObjectId,
        required: true
    },

    challengedId: {
        type: Types.ObjectId,
        required: true
    },

    challengeType: {
        type: Number,
        required: true
    },

    hasMatched: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export interface MatchDocument extends Document {
    challengerId: Types.ObjectId

    challengedId: Types.ObjectId

    hasMatched: Boolean
}

export const matchModel = model<MatchDocument>('Match', matchSchema)
