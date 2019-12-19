import { userController } from '../../controllers/user/user'
import { formData } from '../../middleware/form-data'
import { tokenAuth } from '../../middleware/token-auth'
import { signUpValidation, signInValidation, updateUserValidation } from './validation'

class UserRoutes {
    public setRoutes(app: any): void {
        app.route('/user/sign-up').post(
            formData.uploadNone(),
            signUpValidation.joiValidation,
            signUpValidation.isEmailExist,
            userController.signUp,
            userController.generateEncryptedLink,
            userController.emailSignUpVerification
        )

        app.route('/user/sign-in').post(
            formData.uploadNone(),
            signInValidation.joiValidation,
            userController.signIn
        )

        app.route('/user/check-token').get(
            tokenAuth.tokenAuth,
            userController.checkToken
        )

        app.route('/user/update-user').post(
            formData.uploadNone(),
            updateUserValidation.joiValidation,
            userController.updateUser
        )

        // app.route('/user/account-activation').get(
        //     userController.activateAccount
        // )
    }
}

export const userRoutes: UserRoutes = new UserRoutes()