import { matchModel } from '../../models/match/match'
import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import Joi from '@hapi/joi'

class MessageValidation {
    public joiValidation(req: any, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            conversationId: Joi.string().allow(null, ''),
            receiverId: Joi.string().required(),
            message: Joi.string().required().max(750)
        })

        const { error } = schema.validate(req.body)

        if (error) {
            return res.status(422).json({
                message: error.details[0].message.replace(/"/g, '')
            })
        }

        if (
            !Types.ObjectId.isValid(req.userData._id)
            || !Types.ObjectId.isValid(req.body.receiverId)
        ) {
            return res.status(422).send({ message: 'Invalid form data' });
        }
        

        next()
    }

    async isBothUserMatched(req: any, res: Response, next: NextFunction) {
        const currentUserId = req.userData._id
        const otherUser = req.query.userId

        const match = await matchModel.findOne({
            $or: [
                {
                    challengerId: currentUserId,
                    challengedId: otherUser
                },

                {
                    challengerId: otherUser,
                    challengedId: currentUserId
                },
            ]
        })

        if (!match) {
            return res.status(400).send({
                message: 'You are not matched with this user'
            })
        }

        next()
    }
}

export const messageValidation: MessageValidation = new MessageValidation()