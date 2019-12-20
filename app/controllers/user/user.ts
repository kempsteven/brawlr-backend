import { userModel, SavedUserDocument } from '../../models/user/user'
import nodemailer, { TransportOptions, Transport } from 'nodemailer'
import { Request, Response, NextFunction } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)
const cryptoAlgo = 'aes-256-cbc'

class UserController {
    /* Sign Up Methods */
    public async signUp(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        const salt: string = await bcrypt.genSalt(10)
        const hashedPassword: string = await bcrypt.hash(req.body.password, salt)

        const user = new userModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            bio: req.body.bio,
            gender: req.body.gender,
            age: req.body.age,
            fighterType: req.body.fighterType,
            location: req.body.location
        })

        try {
            const { _id, firstName, lastName, email }: SavedUserDocument = await user.save()

            const response: object = {
                _id,
                firstName,
                lastName,
                email
            }

            res.locals.response = response

            next()
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    public async generateEncryptedLink(req: Request, res: Response, next: NextFunction): Promise<void> {
        const cipher = crypto.createCipheriv(cryptoAlgo, Buffer.from(key), iv)
        let encrypted = cipher.update(JSON.stringify(res.locals.response))

        encrypted = Buffer.concat([encrypted, cipher.final()])

        const ivString = iv.toString('hex')
        const encryptedData = encrypted.toString('hex')

        const response = {
            ...res.locals.response,
            link: `https://brawlr.netlify.com/account-activation?iv=${ivString}&key=${encryptedData}`
        }

        res.locals.response = response

        next()
    }

    public async emailSignUpVerification(req: Request, res: Response): Promise<void | Response> {
        const response = res.locals.response

        const emailTemplate = `
            <html>
            <head>
                <style type="text/css">
                    html, body {
                        width: 100%;
                    }
                    * {
                        box-sizing: border-box;
                        word-break: break-word;
                        word-wrap: break-word;
                        font-family: sans-serif;
                        color: #878787;
                    }
                    .container {
                        width: 450px;
                        border-radius: 5px;
                        margin: 0 auto;
                        background: #fff;
                        border: 1px solid #878787;
                    }
                    .container .header {
                        display: block;
                        width: 100%;
                        text-align: center;
                        margin: 0;
                        background: #4286f4;
                        color: #fff;
                        padding: 15px 0;
                        border-top-left-radius: 5px;
                        border-top-right-radius: 5px;
                        font-size: 24px;
                    }
                    .container .contact-header {
                        display: block;
                        margin-bottom: 10px;
                        padding: 0 20px;
                        font-size: 22px;
                    }
                    .container .contact-sub-header {
                        display: block;
                        margin-bottom: 10px;
                        padding: 0 20px;
                        font-size: 20px;
                    }

                    .container .link-container {
                        display: block;
                        margin-bottom: 10px;
                        padding: 0 20px;
                    }

                    .container .link-container .link-label {
                        margin-right: 10px;
                    }
                </style>
            </head>
            <body>
                <div
                    class="container"
                    style="
                        width: 450px;
                        border-radius: 5px;
                        margin: 0 auto;
                        background: #fff;
                        border: 1px solid #878787;
                        color: #878787;
                    "
                >
                    <h3
                        class="header"
                        style="
                            display: block;
                            width: 100%;
                            text-align: center;
                            margin: 0;
                            background: #4286f4;
                            padding: 15px 0;
                            border-top-left-radius: 5px;
                            border-top-right-radius: 5px;
                            font-size: 22px;
                            font-family: sans-serif;
                            color: #fff;
                        "
                    >
                        Brawlr | Contact
                    </h3>

                    <h3
                        class="contact-header"
                        style="
                            display: block;
                            margin-bottom: 10px;
                            padding: 0 20px;
                            font-size: 18px;
                            font-family: sans-serif;
                            color: #878787;
                        "
                    >
                        Account Activation
                    </h3>

                    <span
                        class="contact-sub-header"
                        style="
                            display: block;
                            margin-bottom: 10px;
                            padding: 0 20px;
                            font-size: 16px;
                            font-family: sans-serif;
                            color: #878787;
                        "
                    >
                        Please click link below to activate
                    </span>

                    <section
                        class="link-container"
                        style="
                            display: block;
                            margin-bottom: 10px;
                            padding: 0 20px;
                            color: #878787;
                            word-break: break-all;
                            font-size: 16px;
                            font-family: sans-serif;
                        "
                    >
                        <span
                            class="link-label"
                            style="
                                margin-bottom: 2px;
                                font-weight: 600;
                                font-family: sans-serif;
                                display: block; 
                            "
                        >
                            Link:
                        </span>

                        <a
                            href="${ response.link }"
                            target="_blank"
                            style="
                                color: #878787;
                            "
                        >
                            ${response.link}
                        </a>
                    </section>
                </div>
            </body>
            </html>
        `

        const email = process.env.GMAIL_CLIENT_USER
        const clientId = process.env.GMAIL_CLIENT_ID
        const clientSecret = process.env.GMAIL_CLIENT_SECRET
        const refreshToken = process.env.GMAIL_CLIENT_REFRESH

        const auth = {
            type: 'oauth2',
            user: email,
            clientId: clientId,
            clientSecret: clientSecret,
            refreshToken: refreshToken,
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            // port: 587,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: auth
        } as TransportOptions | Transport)

        try {
            await transporter.sendMail({
                from: `Brawlr | Contact <${process.env.GMAIL_USER}>`, // sender address
                to: response.email, // list of receivers
                subject: 'Brawlr | Contact', // Subject line
                html: emailTemplate // html body
            })

            return res.status(200).send({
                firstName: response.firstName,
                lastName: response.lastName,
                activationLink: response.link,
                message: 'User created, please activate your account using the link given in your email'
            })
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    /* Account Activation Methods */
    public async decryptEncryptedLink(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        const iv = Buffer.from(req.body.iv, 'hex')

        const encryptedText = Buffer.from(req.body.encryptedData, 'hex')

        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)

        let decrypted = decipher.update(encryptedText)

        decrypted = Buffer.concat([decrypted, decipher.final()])
        
        res.locals.response = { decrypted: decrypted.toString() }

        next()
    }

    public async activateAccount(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        res.send(res.locals.response)
    }

    /* Sign In Methods */
    public async signIn(req: Request, res: Response): Promise<Response> {
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
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as Secret)

        return res.status(200).json({
            token: token,
            message: 'Logged In Successfully'
        })
    }

    /* Check Token Methods */
    public checkToken(req: Request, res: Response): Response {
        return res.status(200).json({
            message: 'Token Authenticated'
        })
    }

    /* Update User Methods */
    public async updateUser(req: any, res: Response): Promise<void | Response> {
        const keyToBeUpdated = [
            'firstName', 'lastName', 'bio',
            'gender', 'age', 'fighterType',
            'location', 'genderPreference', 'ageRange'
        ]

        const propertyToUpdate: any = {}

        keyToBeUpdated.forEach(key => {
            if (req.body[key]) {
                propertyToUpdate[key] = req.body[key]
            }
        })

        try {
            await userModel.updateOne({ _id: req.userData._id }, { $set: propertyToUpdate })

            const {
                _id, firstName, lastName, email,
                bio, gender, age, fighterType,
                location, genderPreference, ageRange
            }: any = await userModel.findById(req.userData._id)

            return res.status(200).send({
                _id, firstName, lastName, email,
                bio, gender, age, fighterType,
                location, genderPreference, ageRange
            })
        } catch (err) {
            return res.status(400).send(err)
        }
    }
}

export const userController: UserController = new UserController()