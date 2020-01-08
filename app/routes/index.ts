import { userRoutes } from './user'
import { matchRoutes } from './match'

export class Routes {
    public routes (app : any) : void {
        userRoutes.setRoutes(app)
        matchRoutes.setRoutes(app)
    }
}