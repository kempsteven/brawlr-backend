import { matchModel } from '../../models/match/match'
import { userModel } from '../../models/user/user'

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
            return res.status(422).send({ message: 'Invalid form data' });
        }

        try {
            const match = await matchModel.find({
                $or: [
                    { 
                        challengerId: req.userData._id,
                        challengedId: req.body.challengedId
                    },

                    {
                        challengerId: req.body.challengedId,
                        challengedId: req.userData._id
                    }
                ],

                hasMatched: true
            })

            if (match && match.length) {
                return res.status(422).send({
                    message: 'Match already exist'
                })
            }

            next()
        } catch (error) {
            return res.status(422).send(error)
        }
    }

    public async validateFightBrawlCount(req: any, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const { brawl, fight }: any = await userModel.findOne({ _id: req.userData._id }).select('brawl fight')

            if (!brawl || !fight) res.status(404).send({ message: 'User cannot be found' })
            
            if (parseInt(req.body.challengeType) === 1 && !parseInt(brawl.remaining)) {
                return res.status(422).send({
                    challengeType: 1,
                    currentDate: new Date(),
                    resetDate: brawl.resetDate,
                    message: 'No brawls remaining'
                })
            }

            if (parseInt(req.body.challengeType) === 0 && !parseInt(fight.remaining)) {
                return res.status(422).send({
                    challengeType: 0,
                    currentDate: new Date(),
                    resetDate: fight.resetDate,
                    message: 'No fights remaining'
                })
            }

            next()
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    public async isValidMatchObjectId (req: any, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const IdArray = [ req.userData._id, req.body.userId ]

            const isIdsNotValid = IdArray.some(id => !Types.ObjectId.isValid(id))
            
            if (isIdsNotValid) {
                return res.status(422).send({ message: 'Invalid form data' });
            }

            const findQuery = {
                                $or: [
                                    {
                                        challengerId: req.userData._id,
                                        challengedId: req.body.userId
                                    },
                                    {
                                        challengerId: req.body.userId,
                                        challengedId: req.userData._id
                                    },
                                ]
                            }

            const match = await matchModel.findOne(findQuery)

            if (!match) {
                return res.status(422).send({ message: 'Invalid form data' });
            }

            next()
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}

export const matchValidation: MatchValidation = new MatchValidation()