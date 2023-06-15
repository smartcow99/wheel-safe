const CustomError = require('../../utils/CustomError');
const { getElectronicService, getPoisearchService } = require('./maps.service');

exports.getPoisearchController = async (req, res) => {
  const data = await getPoisearchService(req.trx);
  return res.status(200).json();
};

exports.getElectronicController = async (req, res) => {
  const data = await getElectronicService(req.trx);
  return res.status(200).json();
};
