require('dotenv').config();
const AWS = require('aws-sdk');
const Joi = require('joi');
const nodemailer = require('nodemailer');

const firebaseAdmin = require('../firebase');
const CustomError = require('./CustomError');
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
const transporter = nodemailer.createTransport(smtpConfig);

/**
 * FCM 알림 발송
 * @param {string} notification.title
 * @param {string} notification.body
 * @param {string} data.id
 * @param {string} data.type
 * @param {string[]} tokens FCM tokens
 */
exports.sendFCM = async (notification, data, tokens) => {
  if (process.env.NODE_ENV === 'test') return;
  try {
    await firebaseAdmin.messaging().sendMulticast({
      notification,
      android: { notification: { channel_id: process.env.ANDROID_CHANNEL_ID } },
      data,
      tokens,
    });
  } catch (err) {
    console.error(err);
    throw new CustomError('FCM_FAILED', 500);
  }
};

/**
 * WEB FCM 알림 발송
 * @param {string} data.id
 * @param {string} data.code FCM Code
 * @param {string} data.title FCM title
 * @param {string} data.body FCM content
 * @param {string} data.url 이동 할 Url
 * @param {string[]} tokens FCM tokens
 */
exports.sendWebFCM = async (data, tokens) => {
  try {
    if (process.env.NODE_ENV === 'test') return;
    await firebaseAdmin.messaging().sendMulticast({ data, tokens });
  } catch (err) {
    console.error(err);
    throw new CustomError('FCM_FAILED', 500);
  }
};

/**
 * 메일 전송
 * @param {string} to 수신인
 * @param {string} subject 제목
 * @param {string} text 내용(일반 텍스트 양식)
 * @param {string} html 내용(HTML 양식)
 */
exports.sendMail = async ({ to, subject, text, html }) => {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const info = await transporter.sendMail({
      from: process.env.CONTACT_EMAIL || 'contact@kokkokexpress.com',
      to: to,
      subject: subject,
      html: text ? null : html,
      text: text,
    });
    return info;
  } catch (err) {
    console.error(err);
    throw new CustomError('MAIL_SERVER_FAILED', 500);
  }
};

/**
 * AWS SNS 문자 전송
 * @description https://docs.aws.amazon.com/sns/latest/dg/sns-mobile-phone-number-as-subscriber.html
 * @description https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples-sending-sms.html
 * @param {string} Message 전송 메시지 내용
 * @param {string} PhoneNumber E.164 전화번호형식
 */
exports.sendSMS = async payload => {
  if (process.env.NODE_ENV === 'test') return;
  // Payload 유효성 검증
  const validation = await Joi.object({
    Message: Joi.string().min(1).max(160),
    PhoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
  })
    .unknown(true)
    .validateAsync(payload);
  if (validation.error) throw new CustomError('INVALID_SMS_PAYLOAD');
  // AWS Configuration
  const config = {
    region: process.env.SNS_REGION,
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
  AWS.config.update(config);
  // Create promise and SNS service object
  const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(payload).promise();
  // Handle promise's fulfilled/rejected states
  publishTextPromise.then(data => data.MessageId).catch(err => console.error(err, err.stack));
};
