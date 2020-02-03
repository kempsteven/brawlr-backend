import { Schema, model, Document, Types } from 'mongoose'
import { PushSubscription } from 'web-push'

const subscriptionSchema = new Schema({
    userId: {
        type: Types.ObjectId
    },

    subscription: {
        type: String
    }
}, { timestamps: true })

export interface SubscriptionDocument extends Document {
    userId: Types.ObjectId

    subscription: string
}

export const subscriptionModel = model<SubscriptionDocument>('Subscription', subscriptionSchema)