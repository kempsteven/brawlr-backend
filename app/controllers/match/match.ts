import { matchModel, MatchDocument } from '../../models/match/match'
import { userModel, SavedUserDocument } from '../../models/user/user'
import { Request, Response, NextFunction } from 'express'
import { io } from '../../server'
import nodeSchedule from 'node-schedule'

interface userMatchReturn extends SavedUserDocument {
    matchId: string
}

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

            const options = {
                select: selectedField,
                page: req.query.page || 1,
                limit: 10
            }

            const matchList: any = await matchModel.paginate(findObject, options)

            if (!matchList) {
                return res.status(404).send()
            }

            const matchIds: Array<string> = []

            const matchedUsersId: Array<string> = matchList.docs
                                                    .reduce((result: Array<string>, item: MatchDocument) => {
                                                        if (`${item.challengerId}` !== `${req.userData._id}`) {
                                                            result.push(`${item.challengerId}`)
                                                            matchIds.push(item._id)
                                                        } else {
                                                            result.push(`${item.challengedId}`)
                                                            matchIds.push(item._id)
                                                        }

                                                        return result
                                                    }, [])
            
            const userList = await userModel
                                    .find({})
                                    .select('-password -createdAt -updatedAt -__v -brawl -fight -status -email')
            
            const matchedUserList = matchedUsersId
                                        .reduce((result: Array<object | undefined>, item, index) => {
                                            let user: any = userList.find(user => `${user._id}` === item)
                                            
                                            user = {
                                                ...user.toObject(),
                                                matchId: matchIds[index]
                                            }

                                            result.push(user)

                                            return result
                                        }, [])

            matchList.docs = matchedUserList

            return res.status(200).send(matchList)
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    /* Umatch User Methods */
    public async unMatchUser (req: any, res: Response, next: NextFunction) {
        try {
            await matchModel.deleteOne({ _id: req.body.matchId })

            return res.status(200).send({
                message: 'Succesfully removed match'
            })
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

    public async updateUsersFightBrawlCount (req: any, res: Response, next: NextFunction) {
        const challengeType = parseInt(req.body.challengeType)
        const userProperty = challengeType ? 'brawl' : 'fight' 

        try {
            const user = await userModel
                                .findOneAndUpdate(
                                    { _id: req.userData._id },
                                    { $inc: { [`${userProperty}.remaining`]: -1 } },
                                    { 'new': true }
                                ).select('fight brawl')

            res.locals.user = user

            next()
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    public async scheduleResetForUsersFightBrawl (req: any, res: Response, next: NextFunction) {
        const { brawl, fight } = res.locals.user
        const shouldScheduleResetForUsersBrawl = !parseInt(brawl.remaining) && !brawl.resetDate
        const shouldScheduleResetForUsersFight = !parseInt(fight.remaining) && !fight.resetDate
        
        const dateToday = new Date()
        const dateTodayTime = dateToday.getTime()

        if (shouldScheduleResetForUsersBrawl) {
            const dateForJob = new Date(dateToday.setTime(dateTodayTime + (24 * 60 * 60 * 1000)))

            await userModel.updateOne({ _id: req.userData._id }, { 'brawl.resetDate': dateForJob })

            nodeSchedule.scheduleJob(dateForJob, async () => {
                await userModel.updateOne(
                                    { _id: req.userData._id },
                                    {
                                        'brawl.remaining': 1,
                                        'brawl.resetDate': null
                                    }
                                )
            })
        }

        if (shouldScheduleResetForUsersFight) {
            const dateForJob = new Date(dateToday.setTime(dateTodayTime + (12 * 60 * 60 * 1000)))

            await userModel.updateOne({ _id: req.userData._id }, { 'fight.resetDate': dateForJob })

            nodeSchedule.scheduleJob(dateForJob, async () => {
                await userModel.updateOne(
                    { _id: req.userData._id },
                    {
                        'fight.remaining': 50,
                        'fight.resetDate': null
                    }
                )
            })
        }

        next()
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

            await match.save()

            return res.status(200).send()
        } catch (error) {
            return res.status(400).send(error)
        }
    }

    public async test(req: any, res: Response, next: NextFunction) {

        // const user = await userModel.updateMany({},
        //     {
        //         '$set': {
        //             'fight.remaining': 50,
        //             'fight.resetDate': null,
        //             'brawl.remaining': 1,
        //             'brawl.resetDate': null,
        //         } 
        //     },
        //     { multi: true }
        // )

        // return res.status(200).send(user)

        // const { brawl, fight }: any = await userModel.find({ _id: req.userData._id }).select('brawl fight')

        // if (req.body.challengeType === 1 && brawl.remaining === 0) {
        //     return res.status(400).send({
        //         resetDate: brawl.resetDate,
        //         message: 'No brawls remaining'
        //     })
        // }

        // if (req.body.challengeType === 0 && fight.remaining === 0) {
        //     return res.status(400).send({
        //         resetDate: brawl.resetDate,
        //         message: 'No fights remaining'
        //     })
        // }

        // const challengeType = req.body.challengeType

        // try {
        //     // if (challengeType === 0) {
        //         await userModel.updateOne({ _id: req.userData._id }, { $inc: { 'fight.remaining': -1 } })
        //     // } else {
        //         // await userModel.updateOne({ _id: req.userData._id }, { $inc: { 'brawl.remaining': -1 } })
        //     // }

        //     return res.status(200).send({
        //         message: 'heyheyhey'
        //     })
        // } catch (error) {
        //     return res.status(400).send(error)
        // }
    }
}

export const matchController: MatchController = new MatchController()