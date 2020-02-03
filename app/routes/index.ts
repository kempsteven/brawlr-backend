import { userRoutes } from './user'
import { matchRoutes } from './match'
import { messageRoutes } from './message'
import { subscriptionRoutes } from './subscription'
import { Request, Response, NextFunction } from 'express'

export class Routes {
    public routes (app : any) : void {
        userRoutes.setRoutes(app)
        matchRoutes.setRoutes(app)
        messageRoutes.setRoutes(app)
        subscriptionRoutes.setRoutes(app)

        app.route('/').get((req: Request, res: Response) => {
            res.status(200).send({ message: 'Hallo Kaffeine' })
        })
    }
}