const CustomError = require('../../utils/CustomError');
const { getReportService } = require('./helps.service');

exports.postReportController = async (req, res) => {};

exports.getReportController = async (req, res) => {
  const { reportInfos, pageInfo } = await getReportService(req.trx, req.uesr);
  return res.status(200).json({ reportInfos, pageInfo });
};

exports.getReportDetailController = async (req, res) => {
  const reportInfo = await getReportDetailService(req.trx, req.params);
  return res.status(200).json(reportInfo);
};
