const router = require('express').Router();

const { auth, asyncWrapper, validator } = require('../../middlewares');
const { signinSchema, signupSchema } = require('../../utils/validationSchema');
const { postUserController, getUserController, delUserController } = require('./users.controller');

router
  .route('/')
  /** 회원 가입 */
  .post(validator(signupSchema), asyncWrapper(postUserController))
  /** 내 정보 조회 */
  .get(auth(), asyncWrapper(getUserController))
  /** 회원 탈퇴 */
  .delete(auth(), asyncWrapper(delUserController));

/** 로그인 */
router.route('signin').post(validator(signinSchema), asyncWrapper(postSigninController));

/** 로그아웃 */
router.route('signout').post(auth(), asyncWrapper(postSignoutController));

module.exports = router;
