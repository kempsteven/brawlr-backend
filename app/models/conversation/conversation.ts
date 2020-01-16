import { Schema, model, Document, Types } from 'mongoose'

const conversationSchema = new Schema({
    senderId: {
        type: Types.ObjectId,
        required: true
    },

    receiverId: {
        type: Types.ObjectId,
        required: true
    },

    senderName: {
        type: String,
        default: ''
    },

    receiverName: {
        type: String,
        default: ''  
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

export interface ConversationDocument extends Document {
    senderId: Types.ObjectId

    receiverId: Types.ObjectId

    lastMessage: Date
}

export const conversationModel = model<ConversationDocument>('Match', conversationSchema)
