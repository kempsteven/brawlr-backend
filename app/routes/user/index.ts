import { userAuthController } from '../../controllers/user/user-authentication'
import { userController } from '../../controllers/user/user'

import { formData } from '../../middleware/form-data'
import { tokenAuth } from '../../middleware/token-auth'

import {
    signUpValidation,
    signInValidation,
    updateUserValidation
} from './validation'

class UserRoutes {
    public setRoutes(app: any): void {
        /* User Authentication and Authorization */
        app.route('/user/sign-up').post(
            formData.uploadNone(),
            signUpValidation.joiValidation,
            signUpValidation.isEmailExist,
            userAuthController.signUp,
            userAuthController.generateEncryptedLink,
            userAuthController.emailSignUpVerification
        )

        app.route('/user/sign-in').post(
            formData.uploadNone(),
            signInValidation.joiValidation,
            userAuthController.signIn
        )

        app.route('/user/check-token').get(
            tokenAuth.tokenAuth,
            userAuthController.checkToken
        )

        app.route('/user/account-activation').post(
            formData.uploadNone(),
            userAuthController.decryptEncryptedLink,
            userAuthController.activateAccount
        )

        /* User CRUD */
        app.route('/user/get-user').get(
            tokenAuth.tokenAuth,
            userController.getUser
        )

        app.route('/user/update-user').post(
            tokenAuth.tokenAuth,
            formData.uploadNone(),
            updateUserValidation.joiValidation,
            userController.updateUser
        )

        app.route('/user/update-user-images').post(
            tokenAuth.tokenAuth,
            formData.multerUploadFields(),
            formData.cloudinaryMultipleUpload,
            userController.updateUserImages
        )
    }
}

export const userRoutes: UserRoutes = new UserRoutes()