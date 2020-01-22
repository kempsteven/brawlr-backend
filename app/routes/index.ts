import { userRoutes } from './user'
import { matchRoutes } from './match'
import { messageRoutes } from './message'

export class Routes {
    public routes (app : any) : void {
        userRoutes.setRoutes(app)
        matchRoutes.setRoutes(app)
        messageRoutes.setRoutes(app)
    }
}