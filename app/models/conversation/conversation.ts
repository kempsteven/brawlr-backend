import mongoosePaginate from 'mongoose-paginate-v2'
import { Schema, model, Document, Types, PaginateModel } from 'mongoose'

const conversationSchema = new Schema({
    userOneId: {
        type: Types.ObjectId,
        required: true
    },

    userOneName: {
        type: String,
        required: false
    },

    userOnePicture: {
        type: String,
        required: false
    },

    userTwoId: {
        type: Types.ObjectId,
        required: true
    },

    userTwoName: {
        type: String,
        required: false
    },

    userTwoPicture: {
        type: String,
        required: false
    },

    lastMessage: {
        type: Object,
        default: () => {
            return {
                senderName: '',
                message: ''
            }
        },
        required: true
    }
}, { timestamps: true })

conversationSchema.plugin(mongoosePaginate)

interface LastMessage {
    senderName: string,
    message: string
}

export interface ConversationDocument extends Document {
    userOneId: Types.ObjectId

    userTwoId: Types.ObjectId

    lastMessage: LastMessage
}

interface conversationPaginateModel<T extends Document> extends PaginateModel<T> { }

export const conversationModel: conversationPaginateModel<ConversationDocument> = model<ConversationDocument>('Conversation', conversationSchema) as conversationPaginateModel<ConversationDocument>
