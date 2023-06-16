const CustomError = require('../../utils/CustomError');
const {
  getElectronicService,
  getPoisearchService,
  getLocationService,
  postPoiOptionService,
} = require('./maps.service');

exports.getPoisearchController = async (req, res) => {
  const { coordinates, norm_x, norm_y } = await getLocationService(req.trx, req.query);
  const passLists = await getPoisearchService(coordinates, norm_x, norm_y);
  const result = await postPoiOptionService(passLists, req.query);
  return res.status(200).json(result);
};

exports.getElectronicController = async (req, res) => {
  const data = await getElectronicService(req.trx);
  return res.status(200).json();
};
