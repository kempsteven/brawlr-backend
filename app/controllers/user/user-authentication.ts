import { userModel, SavedUserDocument } from '../../models/user/user'
import nodemailer, { TransportOptions, Transport } from 'nodemailer'
import { Request, Response, NextFunction } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import cryptoJs from 'crypto-js'

const cryptoKey = 'Yvy1lATGGJ8ffOQFH8leoXXGXao8bQzT'
const iv = crypto.randomBytes(16)
const cryptoAlgo = 'aes-256-cbc'

class UserAuthController {
    /* Sign Up Methods */
    public async signUp(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        const salt: string = await bcrypt.genSalt(10)
        const hashedPassword: string = await bcrypt.hash(req.body.password, salt)

        const user = new userModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            gender: req.body.gender,
            age: req.body.age
        })

        try {
            const { _id, email }: SavedUserDocument = await user.save()

            const response: object = {
                _id,
                email
            }

            res.locals.response = response

            next()
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    public async generateEncryptedLink(req: Request, res: Response, next: NextFunction): Promise<void> {
        const cipher = crypto.createCipheriv(cryptoAlgo, Buffer.from(cryptoKey), iv)
        
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
                        background: #f6f6f6;
                        color: #878787;
                        padding-bottom: 15px;
                    "
                >
                    <h3
                        class="header"
                        style="
                            display: block;
                            width: 100%;
                            text-align: center;
                            margin: 0;
                            background: #da5555;
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
                message: 'User created, please activate your account using the link sent to your email.'
            })
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    /* Account Activation Methods */
    public async decryptEncryptedLink(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const iv = Buffer.from(req.body.iv, 'hex')

            const encryptedText = Buffer.from(req.body.key, 'hex')

            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(cryptoKey), iv)

            let decrypted = decipher.update(encryptedText)

            decrypted = Buffer.concat([decrypted, decipher.final()])

            res.locals.response = decrypted.toString()

            next()
        } catch (err) {
            return res.status(422).json({
                message: 'Invalid link.'
            })
        }
        
    }

    public async activateAccount(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        const { _id } = await JSON.parse(res.locals.response)
        

        const user = await userModel.findOne({ _id })

        if (!user) {
            return res.status(422).json({
                message: 'Invalid link.'
            })
        }

        if (user.status === 1) {
            return res.status(200).send({
                message: 'Account already activated.'
            })
        }

        try {
            await userModel.updateOne({ _id: _id }, { $set: { status: 1 } })

            return res.status(200).send({
                message: 'Account activated, account can now be used.'
            })
        } catch (err) {
            return res.status(400).send(err)
        }
    }

    /* Sign In Methods */
    public async signIn(req: Request, res: Response): Promise<Response> {
        const user = await userModel.findOne({ email: req.body.email })

        if (!user) {
            return res.status(400).json({
                message: 'Authentication Failed.'
            })
        }

        const isPassValid = await bcrypt.compare(req.body.password, user.password)

        if (!isPassValid) return res.status(400).json({
            message: 'Authentication Failed.'
        })

        if (user.status === 0) {
            return res.status(403).send({
                message: 'User has not been activated, Please look at your email and click the activation link.'
            })
        }

        // Encrypt
        const offlineSecretKey = cryptoJs.AES.encrypt(
            process.env.JWT_OFFLINE_SECRET as string,
            process.env.CRYPTO_SECRET as string
        )

        // Create and Assign Token
        const token = jwt.sign({ _id: user._id, key: `${offlineSecretKey}` }, process.env.JWT_SECRET as Secret, { expiresIn: '14d' })

        return res.status(200).json({
            token: token
        })
    }

    /* Check Token Methods */
    public checkToken(req: Request, res: Response): Response {
        return res.status(200).json({
            message: 'Token Authenticated.'
        })
    }
}

export const userAuthController: UserAuthController = new UserAuthController()