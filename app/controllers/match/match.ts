import { matchModel, MatchDocument } from '../../models/match/match'
import { userModel, SavedUserDocument } from '../../models/user/user'
import { Request, Response, NextFunction } from 'express'

import { io } from '../../server'

import { Types } from 'mongoose'

class MatchController {
    /* Get User List Methods */
    public async getUserList(req: any, res: Response, next: NextFunction) {
        const selectedField = 'firstName lastName bio fighterType organization profilePictures gender age location'

        try {
            /* Setting user preferences for user list */
            const { genderPreference, ageRange }: any = await userModel
                                                                .findById({ _id: req.userData._id })
                                                                .select('genderPreference ageRange')
            
            /* For Users Gender Preference  */
            const userGenderPreference = Object.keys(genderPreference)
                                            .reduce((result: Array<object>, gender: string, index: number) => {
                                                // if genderPreference[gender] equal to 0, it would be false and viseversa
                                                const genderValue = !!+genderPreference[gender]
                                                
                                                if (genderValue) result.push({ 'gender.id': `${index === 2 ? 'other-option' : index}` })

                                                return result
                                            }, [])

            /* Getting the Id's of Matched user and not including it on the list */
            const findObject = {
                $or: [
                    {
                        $or: [
                            { challengerId: req.userData._id },
                            { challengedId: req.userData._id }
                        ],

                        hasMatched: true
                    },

                    {
                        challengerId: req.userData._id,

                        hasMatched: false
                    }
                ]
            }

            const matchSelectedField = 'challengerId challengedId'

            const matchList = await matchModel
                                        .find(findObject)
                                        .select(matchSelectedField)

            const currentUserId = `${req.userData._id}`

            let userIdNotIncluded = [ currentUserId ]

            if (matchList.length) {
                userIdNotIncluded = [
                    ...userIdNotIncluded,
                    ...matchList.reduce((result: Array<string>, item) => {
                        const challengerId = `${item.challengerId}`
                        const challengedId = `${item.challengedId}`

                        if (challengerId !== currentUserId) {

                            result.push(challengerId)

                        } else if (challengedId !== currentUserId) {

                            result.push(challengedId)
                            
                        }

                        return result
                    }, [])
                ]
            }
            
            /* Setting User Preference Object to be passed on .find() */
            const userPreference = {
                $and: [
                    { age: { $gte: parseInt(ageRange.from) } },
                    { age: { $lte: parseInt(ageRange.to) } }
                ],
                
                $or: [
                    ...userGenderPreference
                ],

                _id: { $nin: userIdNotIncluded },

                status: 1
            }

            const options = {
                select: selectedField,
                page: req.query.page,
                limit: 20
            }

            const userList = await userModel
                                    .paginate(userPreference, options)


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
                res.locals.isMatched = true
                
                next()

                return
            }

            res.locals.isMatched = false

            next()
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    public async setUpSocketResponse(req: any, res: Response, next: NextFunction) {
        if (!res.locals.isMatched) {
            next()
            return
        }

        const matchedUsers = await userModel
                                    .find({
                                        '_id': {
                                            $in: [
                                                req.userData._id,
                                                req.body.challengedId
                                            ]
                                        }
                                    }).select('_id firstName lastName profilePictures')

        if (!matchedUsers || matchedUsers.length !== 2) return res.status(404).send({ message: 'One/Both of the users cannot be found' })

        const currentUser = matchedUsers.find(user => `${user._id}` === req.userData._id)
        const currentUserId = currentUser?._id
        const currentUserName = currentUser?.firstName
        const currentUserPicture = currentUser?.profilePictures.find(pic => pic.image !== null)?.image.url || null

        const matchedUser = matchedUsers.find(user => `${user._id}` === req.body.challengedId)
        const matchedUserId = matchedUser?._id
        const matchedUserName = matchedUser?.firstName
        const matchedUserPicture = matchedUser?.profilePictures.find(pic => pic.image !== null)?.image.url || null

        const socketResponse = {
            currentUserId,
            currentUserName,
            currentUserPicture,
            matchedUserId,
            matchedUserName,
            matchedUserPicture
        }

        const socketChallengedResponse = {
            currentUserId: matchedUserId,
            currentUserName: matchedUserName,
            currentUserPicture: matchedUserPicture,

            matchedUserId: currentUserId,
            matchedUserName: currentUserName,
            matchedUserPicture: currentUserPicture,
        }


        io.sockets.emit(`${req.userData._id}_new_match`, socketResponse)

        io.sockets.emit(`${req.body.challengedId}_new_match`, socketChallengedResponse)

        return res.status(200).send({
            message: 'Matched.'
        })
    }

    public async challengeUser(req: any, res: Response, next: NextFunction) {
        try {
            const match = new matchModel({
                challengerId: req.userData._id,
                challengedId: req.body.challengedId,
                challengeType: req.body.challengeType
            })

            // io.sockets.emit(`${req.body.challengedId}_new_match`, { message: 'hello nibba' })

            await match.save()

            return res.status(200).send()
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    public async test(req: any, res: Response, next: NextFunction) {

        const user = await userModel.updateMany({},
            {
                '$set': {
                    'fight.remaining': 30,
                    'fight.resetDate': null,
                    'brawl.remaining': 1,
                    'brawl.resetDate': null,
                } 
            },
            { multi: true }
        )

        return res.status(200).send(user)
    }
}

export const matchController: MatchController = new MatchController()