import { matchModel } from '../../models/match/match'
import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import Joi from '@hapi/joi'

class MessageValidation {
    public joiValidation(req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            // senderId: Joi.string().required(),
            receiverId: Joi.string().required(),
            message: Joi.string().required().max(750)
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

export const messageValidation: MessageValidation = new MessageValidation()