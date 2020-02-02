import { userRoutes } from './user'
import { matchRoutes } from './match'
import { messageRoutes } from './message'
import { Request, Response, NextFunction } from 'express'

export class Routes {
    public routes (app : any) : void {
        userRoutes.setRoutes(app)
        matchRoutes.setRoutes(app)
        messageRoutes.setRoutes(app)

        app.route('/').get((req: Request, res: Response) => {
            res.status(200).send({ message: 'Hallo cron-job' })
        })
    }
}