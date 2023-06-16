exports.getReportService = async (trx, { userId }, { page, pageSize }) => {
  const query = trx({ r: 'report' })
    .select({ id: 'r.id', title: 'r.title' })
    .leftJoin({ u: 'user' }, 'r.user_id', 'u.id')
    .where('r.user_id', userId);

  // 페이지네이션 정보
  const { totalCount } = await query
    .clone()
    .select({
      totalCount: trx.raw(`IFNULL(COUNT(d.id), 0)`),
    })
    .first();
  const pageInfo = getPageInfo(totalCount, page, pageSize);
  const reports = await query.clone().limit(pageInfo.dataPerPage).offset(pageInfo.startRow);
  if (!reports) throw new CustomError('REPORTS_NOT_FOUND');
  return { reports, pageInfo };
};

exports.getReportDetailService = async (trx, { reportId }) => {
  const report = await trx({ r: 'report' }).select().where('r.id', reportId);
  if (!report) throw new CustomError('REPORT_NOT_FOUND');
  return { report };
};
