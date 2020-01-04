import { userModel, SavedUserDocument } from '../../models/user/user'
import { Request, Response, NextFunction } from 'express'

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
}

export const userController: UserController = new UserController()