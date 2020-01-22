import mongoosePaginate from 'mongoose-paginate-v2'
import { Schema, model, Document, Types, PaginateModel } from 'mongoose'

const messageSchema = new Schema({
    // conversationId: {
    //     type: Types.ObjectId
    // },

    senderId: {
        type: Types.ObjectId,
        required: true
    },

    receiverId: {
        type: Types.ObjectId,
        required: true
    },

    message: {
        type: String,
        default: '',
        required: true
    },

    attachment: {
        type: String,
        default: ''
    },
}, { timestamps: true })

messageSchema.plugin(mongoosePaginate)

export interface MessageDocument extends Document {
    senderId: Types.ObjectId

    receiverId: Types.ObjectId

    lastMessage: Date
}

interface messagePaginateModel<T extends Document> extends PaginateModel<T> { }

export const messageModel: messagePaginateModel<MessageDocument> = model<MessageDocument>('Message', messageSchema) as messagePaginateModel<MessageDocument>
