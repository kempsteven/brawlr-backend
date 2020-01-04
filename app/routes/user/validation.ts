import { Request, Response, NextFunction } from 'express'
import { userModel } from '../../models/user/user'
import Joi from '@hapi/joi'

class SignUpValidation {
    public joiValidation (req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            firstName: Joi.string().min(2).max(50).required(),

            lastName: Joi.string().min(2).max(50).required(),

            email: Joi.string().min(6).max(255).required().email(),

            password: Joi.string().min(6).max(1024).required(),

            gender: Joi.object({
                id: Joi.number().valid(0, 1, 'other-option').required(),
                value: Joi.string().required().min(1).max(25)
            }),

            age: Joi.number().min(0).max(100)
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

class UpdateUserValidation {
    public joiValidation(req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            firstName: Joi.string().min(2).max(50),

            lastName: Joi.string().min(2).max(50),

            bio: Joi.string().min(0).max(200).allow('', null),

            gender: Joi.object({
                id: Joi.number().valid(0, 1, 'other-option').required(),
                value: Joi.string().required().min(1).max(25)
            }),

            age: Joi.number().min(0).max(100),

            fighterType: Joi.string().min(2).max(50),

            location: Joi.object({
                id: Joi.number().required(),
                value: Joi.string().required().min(1).max(50)
            }),

            // genderPreference: Joi.array().min(1).max(3).items(Joi.number().max(2)),
            // ageRange: Joi.array().min(1).max(2).items(Joi.number().min(1).max(100)),

            genderPreference: Joi.object({
                male: Joi.number().valid(0, 1).required(),
                female: Joi.number().valid(0, 1).required(),
                others: Joi.number().valid(0, 1).required(),
            }),

            ageRange: Joi.object({
                from: Joi.number().min(0).max(99),
                to: Joi.number().min(1).max(100),
            }),

            organization: Joi.string().min(0).max(50).allow('', null),
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

export const updateUserValidation: UpdateUserValidation = new UpdateUserValidation()


