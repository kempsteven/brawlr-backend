import { messageController } from '../../controllers/message/message'

import { formData } from '../../middleware/form-data'
import { tokenAuth } from '../../middleware/token-auth'

import {
    messageValidation,
} from './validation'

class MessageRoutes {
    public setRoutes(app: any): void {
        app.route('/message/get-user-info').get(
            tokenAuth.tokenAuth,
            messageValidation.isValidUserId,
            messageValidation.isBothUserMatched,
            messageController.getUserInfo
        )
        
        app.route('/message/get-conversation-list').get(
            tokenAuth.tokenAuth,
            messageController.getConversationList
        )

        app.route('/message/get-message-list').get(
            tokenAuth.tokenAuth,
            messageValidation.isValidConversationId,
            messageController.getMessageList
        )

        app.route('/message/send-message').post(
            tokenAuth.tokenAuth,
            formData.uploadNone(),
            messageValidation.joiValidation,
            messageValidation.isBothUserMatched,
            messageController.checkConversationExistence,
            messageController.sendMessage
        )
    }
}

export const messageRoutes: MessageRoutes = new MessageRoutes()