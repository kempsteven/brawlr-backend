import { conversationModel, ConversationDocument } from '../../models/conversation/conversation'
import { messageModel, MessageDocument } from '../../models/message/message'
import { Request, Response, NextFunction } from 'express'

class MessageController {
    /* Send Message Method */
    public async sendMessage(req: Request, res: Response, next: NextFunction) {
        
    }
}

export const messageController: MessageController = new MessageController()