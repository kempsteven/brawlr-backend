import { userModel, SavedUserDocument } from '../../models/user/user'
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { Secret } from 'jsonwebtoken'

class UserController {
    public async signUp(req: Request, res: Response): Promise<void | Response> {
        const salt: string = await bcrypt.genSalt(10)
        const hashedPassword: string = await bcrypt.hash(req.body.password, salt)

        const user = new userModel({
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
            const { firstName, lastName }: SavedUserDocument = await user.save()

            return res.status(200).send({
                firstName,
                lastName,
                message: 'User created'
            })
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    public async signIn(req: Request, res: Response): Promise<void | Response> {
        const user = await userModel.findOne({ email: req.body.email })

        if (!user) {
            return res.status(400).json({
                message: 'Authentication Failed'
            })
        }

        const isPassValid = await bcrypt.compare(req.body.password, user.password)

        if (!isPassValid) return res.status(400).json({
            message: 'Authentication Failed'
        })

        // Create and Assign Token
        const token = jwt.sign({ _id: user._id }, process.env.jwt_secret as Secret)

        return res.status(200).json({
            token: token,
            message: 'Logged In Successfully'
        })
    }

    public checkToken(req: Request, res: Response): Response {
        return res.status(200).json({
            message: 'Token Authenticated'
        })
    }
}

export const userController: UserController = new UserController()