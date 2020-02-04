import { userModel, SavedUserDocument } from '../../models/user/user'
import { conversationModel } from '../../models/conversation/conversation'
import { Response, NextFunction } from 'express'

import { messageController } from '../../controllers/message/message'
interface ProfilePictureProperty {
    // profilePictures: Array<object>
}

class UserController {
    constructor () {
        this.updateUser = this.updateUser.bind(this)
    }

    /* Get User Methods */
    public async getUser(req: any, res: Response): Promise<void | Response> {
        try {
            const user = await userModel.findById({ _id: req.userData._id }).select('-__v -password -status')
            
            if (!user) {
                return res.status(404).send({
                    message: 'User not found.'
                })
            }

            return res.status(200).send(user)
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    /* Update User Methods */
    public async updateUser(req: any, res: Response): Promise<void | Response> {
        const keyToBeUpdated = [
            'firstName', 'lastName', 'bio',
            'gender', 'age', 'fighterType',
            'location', 'genderPreference',
            'ageRange', 'organization'
        ]

        const propertyToUpdate: any = {}

        keyToBeUpdated.forEach(key => {
            if (Object.keys(req.body).includes(key)) {
                propertyToUpdate[key] = req.body[key]
            }
        })

        try {
            const beforeUpdatedUser = await userModel.findById({ _id: req.userData._id })

            const user: any = await userModel.findByIdAndUpdate(
                                                req.userData._id,
                                                { $set: propertyToUpdate },
                                                { new: true }
                                            ).select('-__v -password -status')

            res.status(200).send(user)

            this.updateConversationWithYourName(req.userData._id, user, beforeUpdatedUser)
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    public async updateConversationWithYourName(currentUserId: string, updatedProperties: SavedUserDocument, beforeUpdateduser: SavedUserDocument | null) {
        const beforeUpdateFullName = `${beforeUpdateduser?.firstName} ${beforeUpdateduser?.lastName}`
        const updatedFullName = `${updatedProperties?.firstName} ${updatedProperties?.lastName}`
        const isNameUpdated = beforeUpdateFullName !== updatedFullName

        if (!isNameUpdated) return

        const currentUserConversationList = await conversationModel
                                                    .find({
                                                        $or: [
                                                            { userOneId: currentUserId },

                                                            { userTwoId: currentUserId },
                                                        ],
                                                    })

        currentUserConversationList?.forEach(async conversation => {
            if (`${conversation.userOneId}` === `${currentUserId}`) {
                conversation.userOneName = updatedFullName
            } else if (`${conversation.userTwoId}` === `${currentUserId}`) {
                conversation.userTwoName = updatedFullName
            }
            
            if (`${conversation.lastMessage.senderId}` === `${currentUserId}`) {
                conversation.lastMessage.senderName = updatedProperties?.firstName
            }

            const updatedConversation = await conversationModel
                                                .findByIdAndUpdate(
                                                    { _id: conversation._id },
                                                    conversation, 
                                                    { new: true }
                                                )

            messageController.emitUpdatedConversation(
                `${updatedConversation?.userOneId}`,
                `${updatedConversation?.userTwoId}`,
                updatedConversation,
                false
            )
        })
    }

    /* Update User Image Methods */
    public async updateUserImages (req: any, res: Response): Promise<void | Response> {
        const filterIdentifier = [
            'zero', 'one', 'two',
            'three', 'four', 'five'
        ]

        const setObject: any = {
            $set: {}
        }

        const arrayFilterObject: any = {
            arrayFilters: []
        }
        
        /*
            this forEach parses data for setting $set and arrayfilters for userModel.update
                Sample Outcome:

                setObject: {
                    '$set': {
                        profilePictures.$[zero].image: 'imageValuehehe'
                    }
                }

                arrayFilterObject: {
                    arrayFilters: [
                        { 'zero.position': 1 }
                    ]
                }
        */
        req.body.position.forEach((x: string, key: number) => {
            const setProperty = `profilePictures.$[${filterIdentifier[key]}].image`
            const imageObject = req.body.imgFileObj[key]
            setObject['$set'][setProperty] = imageObject

            const filterProperty = `${filterIdentifier[key]}.position`
            arrayFilterObject['arrayFilters'].push({ [filterProperty]: parseInt(x) })
        })

        try {
            await userModel.updateOne(
                { _id: req.userData._id },
                setObject,
                arrayFilterObject
            )

            const user: any = await userModel
                                        .findById({ _id: req.userData._id })
                                        .select('-__v -password -status')
            

            return res.status(200).send(user)
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    /* Remove User Image Method */
    public async removeUserImage (req: any, res: Response, next: NextFunction): Promise<void | Response> {
        const filterIdentifier = [
            'zero', 'one', 'two',
            'three', 'four', 'five'
        ]

        const setObject: any = {
            $set: {}
        }

        const arrayFilterObject: any = {
            arrayFilters: []
        }

        const imageIdToBeRemoved: Array<string> = []

        /*
            this forEach parses data for setting $set and arrayfilters for userModel.update
                Sample Outcome:

                setObject: {
                    '$set': {
                        profilePictures.$[zero].image: 'imageValuehehe'
                    }
                }

                arrayFilterObject: {
                    arrayFilters: [
                        { 'zero.position': 1 }
                    ]
                }
        */
        req.body.profilePictures.forEach((item: any, key: number) => {
            const setProperty = `profilePictures.$[${filterIdentifier[key]}].image`
            setObject['$set'][setProperty] = null

            const filterProperty = `${filterIdentifier[key]}.position`
            arrayFilterObject['arrayFilters'].push({ [filterProperty]: parseInt(item.position) })

            imageIdToBeRemoved.push(item.image)
        })

        try {
            await userModel.updateOne(
                                { _id: req.userData._id },
                                setObject,
                                arrayFilterObject
                            )

            const user: any = await userModel
                                        .findById({ _id: req.userData._id })
                                        .select('-__v -password -status')

            res.locals.response = user
            req.body.imageIdToBeRemoved = imageIdToBeRemoved

            next()
        } catch (err) {
            return res.status(400).send(err)
        }
    }
}

export const userController: UserController = new UserController()