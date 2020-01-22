import mongoosePaginate from 'mongoose-paginate-v2'
import { Schema, model, Document, Types, PaginateModel } from 'mongoose'

const conversationSchema = new Schema({
    userOneId: {
        type: Types.ObjectId,
        required: true
    },

    userTwoId: {
        type: Types.ObjectId,
        required: true
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

export const conversationModel: conversationPaginateModel<ConversationDocument> = model<ConversationDocument>('Match', conversationSchema) as conversationPaginateModel<ConversationDocument>
