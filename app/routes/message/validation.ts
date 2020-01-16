import { matchModel } from '../../models/match/match'
import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import Joi from '@hapi/joi'

class MatchValidation {
    public joiValidation(req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            conversationId: Joi.string(),
            senderId: Joi.string().required(),
            senderName: Joi.string().max(50).required(),
            receiverId: Joi.string().required(),
            message: Joi.string().required().max(750),
            attachment: Joi.string().max(250)
        })

        const { error } = schema.validate(req.body)

        if (error) {
            return res.status(422).json({
                message: error.details[0].message.replace(/"/g, '')
            })
        }

        

        next()
    }
}

export const matchValidation: MatchValidation = new MatchValidation()