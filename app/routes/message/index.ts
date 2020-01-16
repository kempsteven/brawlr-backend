import { messageController } from '../../controllers/message/message'

import { formData } from '../../middleware/form-data'
import { tokenAuth } from '../../middleware/token-auth'

import {
    matchValidation,
} from './validation'

class MatchRoutes {
    public setRoutes(app: any): void {
        app.route('/match/get-user-list').get(
            tokenAuth.tokenAuth,
            matchValidation.joiValidation,
            messageController.sendMessage
        )
    }
}

export const matchRoutes: MatchRoutes = new MatchRoutes()