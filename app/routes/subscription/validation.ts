import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { subscriptionModel } from '../../models/subscription/subscription'
import Joi from '@hapi/joi'

class SubscriptionValidation {
    public joiValidation(req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            userId: Joi.string().required(),

            subscription: Joi.string().required()
        })

        const { error } = schema.validate(req.body)

        if (error) {
            return res.status(422).json({
                message: error.details[0].message.replace(/"/g, '')
            })
        }

        next()
    }

    public async isValidUserId (req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        const userId = req.body.userId
        const reqSubsciption = req.body.subscription
        
        if (!Types.ObjectId.isValid(userId)) {
            return res.status(422).send({ message: 'Invalid form data' });
        }

        const subscription = await subscriptionModel.findOne({ userId: userId })

        if (!subscription) {
            next()

            return
        }

        const isSubscriptionSame = reqSubsciption === subscription.subscription

        if (isSubscriptionSame) {
            return res.status(200).send({ message: 'Subscription already exists.' });
        }
        
        next()
    }
}

export const subscriptionValidation: SubscriptionValidation = new SubscriptionValidation()


