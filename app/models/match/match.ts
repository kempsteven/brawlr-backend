import mongoosePaginate from 'mongoose-paginate-v2'
import { Schema, model, Document, Types, PaginateModel } from 'mongoose'

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

matchSchema.plugin(mongoosePaginate)

export interface MatchDocument extends Document {
    challengerId: Types.ObjectId

    challengedId: Types.ObjectId

    hasMatched: Boolean
}

interface matchPaginateModel<T extends Document> extends PaginateModel<T> { }

export const matchModel: matchPaginateModel<MatchDocument> = model<MatchDocument>('Match', matchSchema) as matchPaginateModel<MatchDocument>