import { Schema, model, Document, Types } from 'mongoose'

const messageSchema = new Schema({
    conversationId: {
        type: Types.ObjectId
    },

    senderId: {
        type: Types.ObjectId,
        required: true
    },

    senderName: {
        type: String,
        default: '',
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

export interface MessageDocument extends Document {
    senderId: Types.ObjectId

    receiverId: Types.ObjectId

    lastMessage: Date
}

export const messageModel = model<MessageDocument>('Match', messageSchema)
