import { conversationModel, ConversationDocument } from '../../models/conversation/conversation'
import { messageModel } from '../../models/message/message'
import { userModel } from '../../models/user/user'
import { Response, NextFunction } from 'express'

class MessageController {
    constructor () {
        this.checkConversationExistence = this.checkConversationExistence.bind(this)
    }

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
            // const userList = await userModel.find({
            //     _id: { $in: [ req.body.receiverId, req.userData._id ]}
            // })

            // const currentUser = userList?.find(user => `${user._id}` === `${req.userData._id}`)
            // const currentUserName = `${currentUser?.firstName} ${currentUser?.lastName}`
            // const currentUserPicture = currentUser?.profilePictures.find(picture => picture.image !== null)

            // const otherUser = userList?.find(user => `${user._id}` === `${req.body.receiverId}`)
            // const otherUserName = `${otherUser?.firstName} ${otherUser?.lastName}`
            // const otherUserPicture = otherUser?.profilePictures.find(picture => picture.image !== null)

            // const conversation = new conversationModel({
            //     userOneId: req.userData._id,
            //     userOneName: currentUserName,
            //     userOnePicture: currentUserPicture ? currentUserPicture.image.url : '',

            //     userTwoId: req.body.receiverId,
            //     userTwoName: otherUserName,
            //     userTwoPicture: otherUserPicture ? otherUserPicture.image.url : '',

            //     lastMessage: {
            //         senderName: currentUserName,
            //         message: req.body.message
            //     }
            // })

            const savedConversation = await this.createNewConversation(req)
            
            res.locals.conversationId = savedConversation._id
            res.locals.hasNewlyCreatedConvo = true
        } else {
            res.locals.conversationId = req.body.conversationId
        }

        next()

        if (conversationResult) {
            this.updateConversationLastMessage(
                req.userData._id,
                req.body.conversationId,
                req.body.message
            )
        }
    }

    public async createNewConversation (req: any) {
        const userList = await userModel.find({
            _id: { $in: [req.body.receiverId, req.userData._id] }
        })

        const currentUser = userList?.find(user => `${user._id}` === `${req.userData._id}`)
        const currentUserName = `${currentUser?.firstName} ${currentUser?.lastName}`
        const currentUserPicture = currentUser?.profilePictures.find(picture => picture.image !== null)

        const otherUser = userList?.find(user => `${user._id}` === `${req.body.receiverId}`)
        const otherUserName = `${otherUser?.firstName} ${otherUser?.lastName}`
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

        return await conversation.save()
    }

    public async updateConversationLastMessage(currentUserId: string, conversationId: string, message: string) {
        const user = await userModel.findById({ _id: currentUserId })

        await conversationModel.updateOne(
            { _id: conversationId },
            {
                'lastMessage.senderName': user?.firstName,
                'lastMessage.message': message
            }
        )
    }

    public async sendMessage (req: any, res: Response, next: NextFunction) {
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

    /* Get User Info */
    public async getUserInfo (req: any, res: Response, next: NextFunction) {
        try {
            const user = await userModel
                                .findOne({ _id: req.query.userId })
                                .select('-password -createdAt -updatedAt -__v -brawl -fight -status -email')

            return res.status(200).send(user)
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    public async getMessageList (req: any, res: Response, next: NextFunction) {
        try {

            const messageQuery = {
                conversationId: req.query.conversationId,

                $or: [
                    { senderId: req.userData._id },
                    { receiverId: req.userData._id },
                ]
            }

            const options = {
                select: '-__v -createdAt -updatedAt -conversationId',
                page: req.query.page || 1,
                limit: 20,
                sort: { createdAt: -1 }
            }

            const messageList = await messageModel
                                            .paginate(messageQuery, options)

            return res.status(200).send(messageList)
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}

export const messageController: MessageController = new MessageController()