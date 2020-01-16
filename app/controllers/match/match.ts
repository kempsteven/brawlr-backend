import { matchModel, MatchDocument } from '../../models/match/match'
import { userModel, SavedUserDocument } from '../../models/user/user'
import { Request, Response, NextFunction } from 'express'

import { io } from '../../server'

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
                                                
                                                if (genderValue) result.push({ 'gender.id': `${index === 2 ? 'other-option' : index}` })

                                                return result
                                            }, [])

            const userPreference = {
                $and: [
                    { age: { $gte: parseInt(ageRange.from) } },
                    { age: { $lte: parseInt(ageRange.to) } }
                ],
                
                $or: [
                    ...userGenderPreference
                ],

                _id: { $nin: req.userData._id }
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
                res.locals.isMatched = true
                
                next()
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

        const currentUser = matchedUsers.find(user => user._id === req.userData._id)
        const currentUserId = currentUser?._id
        const currentUserName = currentUser?.firstName
        const currentUserPicture = currentUser?.profilePictures.find(pic => pic.image !== null)?.image.url || null

        const matchedUser = matchedUsers.find(user => user._id === req.body.challengedId)
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

        // io.sockets.emit(`${req.userData._id}_new_match`, { message: 'hello nibba' })

        const matchedUsers = await userModel.find({
                                        '_id': {
                                            $in: [
                                                '5e1c4c45b943e4001ee894d3',
                                                '5e1c4426b943e4001ee894d2'
                                            ]
                                        }
                                    }).select('firstName lastName profilePictures')

        const currentUser = matchedUsers[0]
        const currentUserId = currentUser._id
        const currentUserName = currentUser.firstName
        const currentUserPicture = currentUser.profilePictures.find(pic => pic.image !== null)?.image.url || null

        const matchedUser = matchedUsers[1]
        const matchedUserId = matchedUser._id
        const matchedUserName = matchedUser.firstName
        const matchedUserPicture = matchedUser.profilePictures.find(pic => pic.image !== null)?.image.url || null

        const test = {
            currentUserId,
            currentUserName,
            currentUserPicture,
            matchedUserId,
            matchedUserName,
            matchedUserPicture
        }

        return res.status(200).send(test)

        return res.status(200).send({})
    }
}

export const matchController: MatchController = new MatchController()