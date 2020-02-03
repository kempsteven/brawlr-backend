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

        const subscription = await subscriptionModel.findOne({ subscription: reqSubsciption })

        if (!subscription) {
            next()
            
            return
        }

        console.log(`${subscription.userId}`)
        console.log(`${userId}`)

        if (`${subscription.userId}` === `${userId}`) {
            return res.status(200).send({ message: 'Subscription already exists.' })
        }

        try {
            /* 
                If subscription.userId is not equal to userId, which means;
                a new user logged in and, the past subscription should be removed,
                so that the new user will not get the old users push notif
            */
            // await subscriptionModel.deleteOne({ subscription: reqSubsciption })
            await subscriptionModel.findOneAndUpdate({ subscription: reqSubsciption }, { userId: userId })

            return res.status(200).send({ message: 'Updated subscription.' })
        } catch (error) {
            return res.status(400).send({ message: 'Subscription deletion failed' })
        }
    }
}

export const subscriptionValidation: SubscriptionValidation = new SubscriptionValidation()


