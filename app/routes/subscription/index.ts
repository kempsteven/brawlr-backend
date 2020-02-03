import { subscriptionController } from '../../controllers/subscription/subscription'

import { formData } from '../../middleware/form-data'
import { tokenAuth } from '../../middleware/token-auth'

import {
    subscriptionValidation,
} from './validation'

class SubscriptionRoutes {
    public setRoutes(app: any): void {
        app.route('/subscription/create-subscription').post(
            tokenAuth.tokenAuth,
            formData.uploadNone(),
            subscriptionValidation.joiValidation,
            subscriptionValidation.isValidUserId,
            subscriptionController.createSubscription
        )
    }
}

export const subscriptionRoutes: SubscriptionRoutes = new SubscriptionRoutes()