import { userController } from '../../controllers/user'

export class UserRoutes {
    public setRoutes(app: any): void {
        app.route('/user/signup').post(userController.signUp)
    }
}