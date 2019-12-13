import { userController } from '../../controllers/user/user'
import { formData } from '../../middleware/form-data'
import { signUpValidation } from './validation'

class UserRoutes {
    public setRoutes(app: any): void {
        app.route('/user/signup').post(
            formData.uploadNone(),
            signUpValidation.joiValidation,
            signUpValidation.isEmailExist,
            userController.signUp
        )

        app.route('/user/signin').post(
            formData.uploadNone(),
            signUpValidation.joiValidation,
            signUpValidation.isEmailExist,
            userController.signUp
        )
    }
}

export const userRoutes: UserRoutes = new UserRoutes()