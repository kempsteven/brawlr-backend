import { matchController } from '../../controllers/match/match'

import { formData } from '../../middleware/form-data'
import { tokenAuth } from '../../middleware/token-auth'

import {
    matchValidation,
} from './validation'

class MatchRoutes {
    public setRoutes(app: any): void {
        app.route('/match/get-user-list').get(
            tokenAuth.tokenAuth,
            matchController.getUserList
        )

        app.route('/match/match-list').get(
            tokenAuth.tokenAuth,
            matchController.getMatchList
        )

        app.route('/match/challenge-user').post(
            tokenAuth.tokenAuth,
            formData.uploadNone(),
            matchValidation.joiValidation,
            matchValidation.isObjectIdsValid,
            matchValidation.validateFightBrawlCount,
            matchController.isChallengedHasChallengedUser,
            matchController.updateUsersFightBrawlCount,
            matchController.scheduleResetForUsersFightBrawl,
            matchController.setUpSocketResponse,
            matchController.challengeUser
        )

        app.route('/match/un-match').post(
            tokenAuth.tokenAuth,
            formData.uploadNone(),
            matchValidation.isValidMatchObjectId,
            matchController.removeConversationAndMessages,
            matchController.unMatchUser,
        )

        app.route('/match/test-socket').post(
            tokenAuth.tokenAuth,
            formData.uploadNone(),
            // matchController.test,
        )
    }
}

export const matchRoutes: MatchRoutes = new MatchRoutes()