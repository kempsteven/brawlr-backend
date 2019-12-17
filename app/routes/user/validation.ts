import { Request, Response, NextFunction } from 'express'
import { userModel } from '../../models/user/user'
import Joi from '@hapi/joi'

class SignUpValidation {
    public joiValidation (req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            firstName: Joi.string().min(2).max(255).required(),

            lastName: Joi.string().min(2).max(255).required(),

            email: Joi.string().min(6).max(255).required().email(),

            password: Joi.string().min(6).max(1024).required(),

            bio: Joi.string().min(0).max(250).allow('', null),

            age: Joi.number().max(130),

            fighterType: Joi.string().min(2).max(255).required(),

            location: Joi.string().min(2).max(255).required()
        })

        const { error } = schema.validate(req.body)

        if (error) {
            return res.status(422).json({
                message: error.details[0].message.replace(/"/g, '')
            })
        }

        next()
    }

    public async isEmailExist (req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        const isEmailExist = await userModel.findOne({ email: req.body.email })

        if (isEmailExist) {
            return res.status(422).json({
                message: 'Email already exists'
            })
        }

        next()
    }
}

export const signUpValidation: SignUpValidation = new SignUpValidation()

class SignInValidation {
    public joiValidation(req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            email: Joi.string().email().required(),

            password: Joi.required(),
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

export const signInValidation: SignInValidation = new SignInValidation()


