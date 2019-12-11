import { Request, Response } from 'express'
import { userRoutes } from './user'

export class Routes {
    public routes (app : any) : void {
        userRoutes.setRoutes(app)
    }
}