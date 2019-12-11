import * as mongoose from 'mongoose'
import User from '../../models/user/user'
import { Request, Response } from 'express'

class UserController {
    public async signUp(req: Request, res: Response): Promise<void | Response> {
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            userInformation: req.body.userInformation
        })

        try {
            const savedUser = await user.save()

            res.status(200).send(savedUser)
        } catch (err) {
            res.status(400).send(err)
        }
    }
}

export const userController: UserController = new UserController()