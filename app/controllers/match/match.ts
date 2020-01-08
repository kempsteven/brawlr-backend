import { matchModel, MatchDocument } from '../../models/match/match'
import { userModel, SavedUserDocument } from '../../models/user/user'
import { Request, Response, NextFunction } from 'express'

class MatchController {
    /* Get User List Methods */
    public async getUserList(req: any, res: Response, next: NextFunction) {
        const selectedField = 'firstName lastName bio fighterType organization profilePictures gender age'

        try {
            // Setting user preferences for user list
            const { genderPreference, ageRange }: any = await userModel
                                .findById({ _id: req.userData._id })
                                .select('genderPreference ageRange')

            const userGenderPreference = Object.keys(genderPreference)
                                            .reduce((result: Array<object>, gender: string, index: number) => {
                                                // if genderPreference[gender] equal to 0, it would be false and viseversa
                                                const genderValue = !!+genderPreference[gender]
                                                
                                                if (genderValue) result.push({ 'gender.id': `${index}` })

                                                return result
                                            }, [])

            const userPreference = {
                $and: [
                    { age: { $gte: parseInt(ageRange.from) - 1 } },
                    { age: { $lte: parseInt(ageRange.to) + 1 } }
                ],
                
                $or: [
                    ...userGenderPreference
                ]
            }

            const userList = await userModel
                                    .find(userPreference)
                                    .select(selectedField)

            if (!userList) {
                return res.status(404).send({
                    message: 'No user yet'
                })
            }

            return res.status(200).send(userList)
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    /* Get Matches Method */
    public async getMatchList(req: any, res: Response, next: NextFunction) {
        try {
            const findObject = {
                $or: [
                    { challengerId: req.userData._id },
                    { challengedId: req.userData._id }
                ],
                
                hasMatched: true
            }

            const selectedField = '-_v -createdAt -updatedAt'

            const matchList = await matchModel
                                    .find(findObject)
                                    .select(selectedField)

            if (!matchList) {
                return res.status(404).send()
            }

            return res.status(200).send(matchList)
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    /* Challenge User Methods */
    public async isChallengedHasChallengedUser (req: any, res: Response, next: NextFunction) {
        try {
            const match = await matchModel
                                .findOneAndUpdate(
                                    {
                                        challengerId: req.body.challengedId,
                                        challengedId: req.userData._id
                                    },
                                    { hasMatched: true }
                                )

            if (match) {
                return res.status(200).send({
                    message: `It's a match`
                })
            }

            next()
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    public async challengeUser(req: any, res: Response, next: NextFunction) {
        try {
            const match = new matchModel({
                challengerId: req.userData._id,
                challengedId: req.body.challengedId,
                challengeType: req.body.challengeType
            })

            await match.save()

            return res.status(200).send()
        } catch (error) {
            return res.status(400).send(error)
        }
    }
}

export const matchController: MatchController = new MatchController()