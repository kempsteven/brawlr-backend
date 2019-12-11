import { Request, Response, NextFunction } from 'express'
import Joi from '@hapi/joi'

class UserValidation {
    public validateSignUp (req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            firstName: Joi.string().min(6).max(255).required(),

            lastName: Joi.string().min(6).max(255).required(),

            email: Joi.string().min(6).max(255).required().email(),

            password: Joi.string().min(6).max(1024).required(),

            userInformation: Joi.object({
                bio: Joi.string().min(0).max(250).allow('', null),

                age: Joi.number().max(130),

                fighterType: Joi.string().min(2).max(255).required(),

                location: Joi.string().min(2).max(255).required()
            }).required()
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

export const userValidation: UserValidation = new UserValidation()


