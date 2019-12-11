import { userController } from '../../controllers/user/user'
import { userValidation } from './validation'

class UserRoutes {
    public setRoutes(app: any): void {
        app.route('/user/signup').post(
            userValidation.validateSignUp,
            userController.signUp
        )
    }
}

export const userRoutes: UserRoutes = new UserRoutes()