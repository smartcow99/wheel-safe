const CustomError = require('../../utils/CustomError');
const { getUserService, postUserService } = require('./users.service');

exports.getUserController = async (req, res) => {
  return res.status(200).json();
};

exports.postUserController = async (req, res) => {
  const userInfo = await postUserService(req.trx);
  if (!userInfo) throw new CustomError('USER_NOT_FOUND');
  return res.status(201).json();
};

exports.delUserController = async (req, res) => {
  return res.status(200).json();
};
