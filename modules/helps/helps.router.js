const router = require('express').Router();

const { auth, asyncWrapper, validator } = require('../../middlewares');
const {
  getReportController,
  postReportController,
  getReportDetailController,
} = require('./helps.controller');

router
  .route('/report')
  /** report 목록 조회 */
  .get(auth(), validator(getReportSchema), asyncWrapper(getReportController))
  /** report 등록 */
  .post(auth(), validator(), asyncWrapper(postReportController));

router
  .route(`/report/:reportId(${REGEX.UUID})`)
  /** report 상세 정보 조회 */
  .get(auth(), validator(), asyncWrapper(getReportDetailController));

module.exports = router;
