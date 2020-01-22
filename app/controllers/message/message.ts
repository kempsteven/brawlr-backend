import { conversationModel } from '../../models/conversation/conversation'
import { messageModel } from '../../models/message/message'
import { userModel } from '../../models/user/user'
import { Response, NextFunction } from 'express'

class MessageController {
    /* Get Message Conversation List */
    public async getConversationList (req: any, res: Response, next: NextFunction) {
        try {
            const conversationQuery = {
                $or: [
                    { userOneId: req.userData._id },

                    { userTwoId: req.userData._id },
                ]
            }

            const options = {
                select: '-__v',
                page: req.query.page || 1,
                limit: 20
            }

            const conversationList = await conversationModel
                                            .paginate(conversationQuery, options)

            return res.status(200).send(conversationList)
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    /* Send Message Method */
    public async checkConversationExistence (req: any, res: Response, next: NextFunction) {
        const conversationResult = await conversationModel
                                            .findOne({
                                                $or: [
                                                    {
                                                        userOneId: req.userData._id,
                                                        userTwoId: req.body.receiverId
                                                    },

                                                    {
                                                        userOneId: req.body.receiverId,
                                                        userTwoId: req.userData._id
                                                    },
                                                ]
                                            })

        if (conversationResult && !req.body.conversationId) {
            return res.status(422).send({
                message: 'conversationId is required'
            })
        }

        if (!conversationResult) {
            const userList = await userModel.find({
                _id: { $in: [ req.body.receiverId, req.userData._id ]}
            })

            const currentUser = userList?.find(user => `${user._id}` === `${req.userData._id}`)
            const currentUserName = currentUser?.firstName
            const currentUserPicture = currentUser?.profilePictures.find(picture => picture.image !== null)

            const otherUser = userList?.find(user => `${user._id}` === `${req.body.receiverId}`)
            const otherUserName = otherUser?.firstName
            const otherUserPicture = otherUser?.profilePictures.find(picture => picture.image !== null)

            const conversation = new conversationModel({
                userOneId: req.userData._id,
                userOneName: currentUserName,
                userOnePicture: currentUserPicture ? currentUserPicture.image.url : '',

                userTwoId: req.body.receiverId,
                userTwoName: otherUserName,
                userTwoPicture: otherUserPicture ? otherUserPicture.image.url : '',

                lastMessage: {
                    senderName: currentUserName,
                    message: req.body.message
                }
            })

            const savedConversation = await conversation.save()
            
            res.locals.conversationId = savedConversation._id
            res.locals.hasNewlyCreatedConvo = true
        } else {
            res.locals.conversationId = req.body.conversationId
        }

        next()

        if (conversationResult) {
            const user = await userModel.findById({ _id: req.userData._id })

            await conversationModel.updateOne(
                { _id: req.body.conversationId },
                {
                    'lastMessage.senderName': user?.firstName,
                    'lastMessage.message': req.body.message
                }
            )
        }
    }

    public async sendMessage(req: any, res: Response, next: NextFunction) {
        try {
            const message = new messageModel({
                conversationId: res.locals.conversationId,
                senderId: req.userData._id,
                receiverId: req.body.receiverId,
                message: req.body.message
            })

            await message.save()

            if (res.locals.hasNewlyCreatedConvo) {
                return res.status(200).send({
                    conversationId: res.locals.conversationId
                })
            }

            return res.status(204).send()
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}

export const messageController: MessageController = new MessageController()