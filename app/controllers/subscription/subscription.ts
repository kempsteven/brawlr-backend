import { subscriptionModel } from '../../models/subscription/subscription'
import { userModel } from '../../models/user/user'
import { Response } from 'express'
import webPush from 'web-push'

class SubscriptionController {
    private publicKey = process.env.WEB_PUSH_PUBLIC_KEY || ''
    private privateKey = process.env.WEB_PUSH_PRIVATE_KEY || ''

    constructor () {
        webPush.setVapidDetails(
            'mailto:brawlr.contact@gmail.com',
            this.publicKey,
            this.privateKey
        )
    }

    /* Create New Subscription */
    public async createSubscription (req: any, res: Response): Promise<void | Response> {
        try {
            const subscription = new subscriptionModel({
                userId: req.body.userId,
                subscription: req.body.subscription,
            })

            const savedSubscription = await subscription.save()

            res.status(200).send(savedSubscription)
        } catch (error) {
            res.status(400).send(error)
        }
    }

    public async sendNotification (currentUserId: string, userId: string, title: string, message: string, url: string) {
        try {
            const currentUser = await userModel.findById({ _id: currentUserId })

            const currentUserFirstName = currentUser?.firstName

            const payload = JSON.stringify({
                                title: title,
                                message: `${currentUserFirstName}: ${message}`,
                                url: url
                            })

            const subscription = await subscriptionModel.find({ userId: userId })

            if (!subscription) return

            // console.log(subscription)

            // const x = await webPush.sendNotification(JSON.parse(subscription.subscription), payload)

            // console.log(x)
            
            subscription.forEach(async (sub) => {
                await webPush.sendNotification(JSON.parse(sub.subscription), payload)
            })

            // console.log('No Error')
            // const x = await webPush.sendNotification(JSON.parse(subscription.subscription), payload)
            // console.log(x)

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}

export const subscriptionController: SubscriptionController = new SubscriptionController()