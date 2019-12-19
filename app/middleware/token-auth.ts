import { Response, NextFunction } from 'express'
import jwt, { Secret } from 'jsonwebtoken'

class TokenAuth {
    public tokenAuth = (req: any, res: Response, next: NextFunction): Response | void  => {
        try {
            const token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret)
            req.userData = decoded

            next()
        } catch (error) {
            return res.status(401).json({
                message: 'Authentication failed.'
            })
        }
    }
}

export const tokenAuth: TokenAuth = new TokenAuth()