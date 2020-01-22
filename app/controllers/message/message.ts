// import { conversationModel, ConversationDocument } from '../../models/conversation/conversation'
import { messageModel, MessageDocument } from '../../models/message/message'
import { Request, Response, NextFunction } from 'express'

class MessageController {
    /* Get Message Conversation List */
    public async getConversationList (req: any, res: Response, next: NextFunction) {
        // const currentUser = req.userData._id
        // const otherUser = 

        // try {
        //     const conversationList = await messageModel.find({  })

        //     return res.status(200).send(conversationList)
        // } catch (error) {
        //     return res.status(400).send(error)
        // }
    }

    /* Send Message Method */
    // public async checkConversationExistence (req: any, res: Response, next: NextFunction) {
        // const conversation = await conversationModel.findOne({
        //                         $or: [
        //                             {
        //                                 userOneId: req.body.userData._id,
        //                                 userTwoId: req.body.receiverId
        //                             },

        //                             {
        //                                 userOneId: req.body.receiverId,
        //                                 userTwoId: req.body.userData._id
        //                             },
        //                         ]
        //                     })

        // if (!conversation) {

        // }
    // }

    public async sendMessage(req: any, res: Response, next: NextFunction) {
        try {
            const message = new messageModel({
                senderId: req.userData._id,
                receiverId: req.body.receiverId,
                message: req.body.message
            })

            await message.save()

            return res.status(200).send()
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}

export const messageController: MessageController = new MessageController()