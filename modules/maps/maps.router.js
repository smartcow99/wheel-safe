const router = require('express').Router();

const { auth, asyncWrapper, validator } = require('../../middlewares');
const { getPoisearchController, getElectronicController } = require('./maps.controller');

router
  /** 안전한 길 찾기 위도, 경도 조회 */
  .route('/poisearch')
  .get(auth(), validator(), asyncWrapper(getPoisearchController));

router
  /** 안전한 길 찾기 위도, 경도 조회 */
  .route('/electronic')
  .get(auth(), validator(), asyncWrapper(getElectronicController));

module.exports = router;
