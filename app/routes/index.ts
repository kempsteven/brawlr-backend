import { Request, Response } from 'express'
// import { StudentController } from '../controllers/studentController'
import { UserRoutes } from './user'

export class Routes {
    // studentController: StudentController = new StudentController()
    public userRoute: UserRoutes = new UserRoutes()

    public routes (app : any) : void {
        this.userRoute.setRoutes(app)
    }
}