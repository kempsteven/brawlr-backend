import * as mongoose from 'mongoose'
import User from '../../models/user/user'
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'

interface SavedUser {
    firstName: string
    lastName: string
    email: string
}

class UserController {
    public async signUp(req: Request, res: Response): Promise<void | Response> {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            bio: req.body.bio,
            age: req.body.age,
            fighterType: req.body.fighterType,
            location: req.body.location
        })

        try {
            const { firstName, lastName, email }: SavedUser = await user.save()

            res.status(200).send({
                firstName,
                lastName,
                email
            })
        } catch (err) {
            res.status(400).send(err)
        }
    }
}

export const userController: UserController = new UserController()