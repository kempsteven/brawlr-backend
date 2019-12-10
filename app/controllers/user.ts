import * as mongoose from 'mongoose'
import User from '../models/user'
import { Request, Response } from 'express'
import Joi from '@hapi/joi'

const signUpSchema = {
    firstName: Joi.string().min(6).max(255).required(),
    lastName: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
}

class UserController {
    public async signUp (req: Request, res: Response) {
        const validation = Joi.validate(req.body, signUpSchema)

        // const user = new User({
        //     firstName: req.body.firstName,
        //     lastName: req.body.lastName,
        //     email: req.body.email,
        //     password: req.body.password
        // })

        // try {
        //     const savedUser = await user.save()
        //     res.status(200).send(savedUser)
        // } catch (err) {
        //     res.status(400).send(err)
        // }
    }
}

export const userController: UserController = new UserController()