import { matchModel } from '../../models/match/match'
import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import Joi from '@hapi/joi'

class MatchValidation {
    public joiValidation(req: Request, res: Response, next: NextFunction): void | Response {
        const schema = Joi.object({
            challengedId: Joi.string().required(),
            challengeType: Joi.number().valid(0, 1).required()
        })

        const { error } = schema.validate(req.body)

        if (error) {
            return res.status(422).json({
                message: error.details[0].message.replace(/"/g, '')
            })
        }

        next()
    }

    public async isObjectIdsValid (req: any, res: Response, next: NextFunction): Promise<void | Response> {
        if (
            !Types.ObjectId.isValid(req.userData._id)
            || !Types.ObjectId.isValid(req.body.challengedId)
        ) {
            return res.status(400).send({ message: 'Invalid form data' });
        }

        try {
            const match = await matchModel.find({ challengerId: req.userData._id, challengedId: req.body.challengedId })

            if (match && match.length) {
                return res.status(400).send({
                    message: 'Match already exist'
                })
            }

            next()
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}

export const matchValidation: MatchValidation = new MatchValidation()