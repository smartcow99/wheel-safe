const Joi = require('joi');

const CustomError = require('./CustomError');

const { REGEX } = require('.');

exports.signinSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .pattern(/^[\w\.-]+@[\w-]+(\.\w{2,4}){1,2}$/)
      .required(),
    password: Joi.string().max(100),
    client: Joi.string().valid('app', 'web'),
  }),
}).unknown(true);

exports.generateEmailAuthCodeSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .pattern(/^[\w\.-]+@[\w-]+(\.\w{2,4}){1,2}$/)
      .required(),
  }),
}).unknown(true);

exports.verifyEmailAuthCodeSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .pattern(/^[\w\.-]+@[\w-]+(\.\w{2,4}){1,2}$/)
      .required(),
    authCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required(),
  }),
}).unknown(true);
exports.signupSchema = Joi.object({
  body: Joi.object({
    authCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .error(new CustomError('INVALID_AUTH_CODE')),
    name: Joi.string().max(100).required().error(new CustomError('INVALID_NAME')),
    phone: Joi.string()
      .pattern(/^\d{10,15}$/)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
    email: Joi.string()
      .pattern(/^[\w\.-]+@[\w-]+(\.\w{2,4}){1,2}$/)
      .error(new CustomError('INVALID_EMAIL')),
    password: Joi.string().max(255).required().error(new CustomError('INVALID_PASSWORD')),
    client: Joi.string().valid('app').error(new CustomError('INVALID_CLIENT_TYPE')),
  }).unknown(true),
}).unknown(true);
