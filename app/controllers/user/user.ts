import { userModel, SavedUserDocument } from '../../models/user/user'
import { Request, Response, NextFunction } from 'express'

interface ProfilePictureProperty {
    profilePictures: Array<object>
}

class UserController {
    /* Get User Methods */
    public async getUser(req: any, res: Response): Promise<void | Response> {
        try {
            const user = await userModel.findById({ _id: req.userData._id }).select('-__v -password -status')
            
            if (!user) {
                return res.status(404).send({
                    message: 'User not found.'
                })
            }

            return res.status(200).send(user)
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    /* Update User Methods */
    public async updateUser(req: any, res: Response): Promise<void | Response> {
        const keyToBeUpdated = [
            'firstName', 'lastName', 'bio',
            'gender', 'age', 'fighterType',
            'location', 'genderPreference',
            'ageRange', 'organization'
        ]

        const propertyToUpdate: any = {}

        keyToBeUpdated.forEach(key => {
            if (Object.keys(req.body).includes(key)) {
                propertyToUpdate[key] = req.body[key]
            }
        })

        try {
            await userModel.updateOne({ _id: req.userData._id }, { $set: propertyToUpdate })

            const user: any = await userModel.findById(req.userData._id).select('-__v -password -status')

            return res.status(200).send(user)
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    /* Update User Image Methods */
    public async updateUserImages (req: any, res: Response): Promise<void | Response> {
        const propertyToUpdate: ProfilePictureProperty = {
            profilePictures: []
        }

        req.body.position.forEach((x: number, key: number) => {
            propertyToUpdate.profilePictures.push({
                position: x,
                image: req.body.imgFileObj[key]
            })
        })

        try {
            await userModel.updateOne({ _id: req.userData._id }, { $set: propertyToUpdate })

            const user: any = await userModel
                                        .findById({ _id: req.userData._id })
                                        .select('-__v -password -status')

            return res.status(200).send(user)
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    /* Remove User Image Method */
    public async removeUserImage (req: any, res: Response, next: NextFunction): Promise<void | Response> {
        const imageIdToBeRemoved: Array<string> = []

        try {
            const ImgPositionToRemove: Array<string> = []
            
            const profilePicture: any = req.body.profilePictures

            Object.keys(profilePicture).forEach(key => {
                const picture = profilePicture[key]
                
                ImgPositionToRemove.push(`${picture.position}`)
                imageIdToBeRemoved.push(picture.image)
            })

            await userModel.updateOne(
                { _id: req.userData._id },
                {
                    $pull: {
                        profilePictures: {
                            position: {
                                $in: ImgPositionToRemove
                            }
                        }
                    }
                }
            )

            req.body.imageIdToBeRemoved = imageIdToBeRemoved

            const user = await userModel.findById({ _id: req.userData._id }).select('-__v -password -status')

            res.locals.response = user

            next()
        } catch (err) {
            return res.status(400).send(err)
        }
    }
}

export const userController: UserController = new UserController()