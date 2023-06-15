const Joi = require('joi');

const CustomError = require('./CustomError');
const {
  FAVORITE_TYPE,
  HELP_TYPE,
  PAYMENT_TYPE,
  SHIPMENT_TYPE,
  SHIPMENT_STATUS,
  CLAIM_TYPE,
  VEHICLE_TYPE,
  ITEM_TYPE,
} = require('./category');
const { REGEX } = require('.');

exports.osSchema = Joi.object({
  query: Joi.object({
    os: Joi.string().valid('android', 'ios').required().error(new CustomError('INVALID_OS')),
  }).unknown(true),
}).unknown(true);

exports.authCodeGenerationSchema = Joi.object({
  query: Joi.object({
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .required()
      .error(new CustomError('INVALID_COUNTRY_CODE')),
    phone: Joi.string()
      .pattern(/\d{10,15}/)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
  }).unknown(true),
}).unknown(true);

exports.authCodeVerificationSchema = Joi.object({
  body: Joi.object({
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .required()
      .error(new CustomError('INVALID_COUNTRY_CODE')),
    phone: Joi.string()
      .pattern(/^\d{10,15}$/)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
    authCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .error(new CustomError('INVALID_AUTH_CODE')),
  }),
}).unknown(true);

exports.postShipperSchema = Joi.object({
  body: Joi.object({
    authCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .error(new CustomError('INVALID_AUTH_CODE')),
    name: Joi.string().max(100).required().error(new CustomError('INVALID_NAME')),
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .error(new CustomError('INVALID_COUNTRY_CODE')),
    langCode: Joi.string()
      .pattern(/^[a-z]{2}$/)
      .error(new CustomError('INVALID_LANG_CODE')),
    phone: Joi.string()
      .pattern(/^\d{10,15}$/)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
    email: Joi.string()
      .pattern(/^[\w\.-]+@[\w-]+(\.\w{2,4}){1,2}$/)
      .error(new CustomError('INVALID_EMAIL')),
    password: Joi.string().max(255).required().error(new CustomError('INVALID_PASSWORD')),
    fcmToken: Joi.string().max(255).error(new CustomError('INVALID_FCM_TOKEN')),
    client: Joi.string().valid('app').error(new CustomError('INVALID_CLIENT_TYPE')),
    marketing: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .error(new CustomError('INVALID_MARKETING_NOTI_TYPE')),
  }).unknown(true),
}).unknown(true);

exports.putPasswordSchema = Joi.object({
  body: Joi.object({
    authCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .error(new CustomError('INVALID_AUTH_CODE')),
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .required()
      .error(new CustomError('INVALID_COUNTRY_CODE')),
    phone: Joi.string()
      .pattern(/^\d{10,15}$/)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
    password: Joi.string().max(255).required().error(new CustomError('INVALID_PASSWORD')),
  }).unknown(true),
}).unknown(true);

exports.signinSchema = Joi.object({
  body: Joi.object({
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .required()
      .error(new CustomError('INVALID_COUNTRY_CODE')),
    langCode: Joi.string()
      .pattern(/^[a-z]{2}$/)
      .error(new CustomError('INVALID_LANG_CODE')),
    phone: Joi.string()
      .pattern(/^\d{10,15}$/)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
    password: Joi.string().max(255).required().error(new CustomError('INVALID_PASSWORD')),
    fcmToken: Joi.string().max(255).error(new CustomError('INVALID_FCM_TOKEN')),
    client: Joi.string().valid('app').error(new CustomError('INVALID_CLIENT_TYPE')),
  }).unknown(true),
}).unknown(true);

exports.putNameSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().max(100).required().error(new CustomError('INVALID_NAME')),
  }),
}).unknown(true);

exports.patchPasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().max(255).required().error(new CustomError('INVALID_PASSWORD')),
    newPassword: Joi.string().max(255).required().error(new CustomError('INVALID_PASSWORD')),
  }),
}).unknown(true);

exports.getEmailAuthSchema = Joi.object({
  query: Joi.object({
    email: Joi.string()
      .pattern(/^[\w\.-]+@[\w-]+(\.\w{2,4}){1,2}$/)
      .required()
      .error(new CustomError('INVALID_EMAIL')),
  }),
}).unknown(true);

exports.putEmailSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .pattern(/^[\w\.-]+@[\w-]+(\.\w{2,4}){1,2}$/)
      .required()
      .error(new CustomError('INVALID_EMAIL')),
    authCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .error(new CustomError('INVALID_AUTH_CODE')),
  }),
}).unknown(true);

exports.postFavoriteSchema = Joi.object({
  body: Joi.object({
    place: Joi.string().max(100).required().error(new CustomError('INVALID_PLACE')),
    address: Joi.string().max(255).required().error(new CustomError('INVALID_ADDRESS')),
    addressDetail: Joi.string()
      .max(255)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_ADDRESS_DETAIL')),
    name: Joi.string().max(100).allow(null).required().error(new CustomError('INVALID_NAME')),
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_COUNTRY_CODE')),
    phone: Joi.string()
      .pattern(/\d{10,15}/)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .error(new CustomError('INVALID_LONGITUDE')),
    latitude: Joi.number().min(-90).max(90).required().error(new CustomError('INVALID_LATITUDE')),
    type: Joi.string()
      .valid(...Object.keys(FAVORITE_TYPE))
      .required()
      .error(new CustomError('INVALID_TYPE')),
    placeId: Joi.string()
      .max(65535)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_PLACE_ID')),
  }),
}).unknown(true);

exports.putFavoriteSchema = Joi.object({
  body: Joi.object({
    place: Joi.string().max(100).required().error(new CustomError('INVALID_PLACE')),
    address: Joi.string().max(255).required().error(new CustomError('INVALID_ADDRESS')),
    addressDetail: Joi.string()
      .max(255)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_ADDRESS_DETAIL')),
    name: Joi.string().max(100).allow(null).required().error(new CustomError('INVALID_NAME')),
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_COUNTRY_CODE')),
    phone: Joi.string()
      .pattern(/\d{10,15}/)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .error(new CustomError('INVALID_LONGITUDE')),
    latitude: Joi.number().min(-90).max(90).required().error(new CustomError('INVALID_LATITUDE')),
    placeId: Joi.string()
      .max(65535)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_PLACE_ID')),
  }),
}).unknown(true);

exports.getNoticesSchema = Joi.object({
  query: Joi.object({
    nextCursor: Joi.string().pattern(/^\d+$/).error(new CustomError('INVALID_NEXT_CURSOR')),
    itemCount: Joi.number().integer().min(0).error(new CustomError('INVALID_ITEM_COUNT')),
  }),
}).unknown(true);

exports.postHelpSchema = Joi.object({
  body: Joi.object({
    type: Joi.string()
      .valid(...Object.keys(HELP_TYPE))
      .required()
      .error(new CustomError('INVALID_TYPE')),
    shipmentId: Joi.when('type', {
      is: 'order',
      then: Joi.string().uuid().allow(null).required(),
      otherwise: null,
    }).error(new CustomError('INVALID_ID')),
    subject: Joi.string().max(100).required().error(new CustomError('INVALID_SUBJECT')),
    description: Joi.string().required().error(new CustomError('INVALID_DESCRIPTION')),
    attachment1: Joi.string()
      .regex(REGEX.S3_KEY)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_ATTACHMENT')),
    attachment2: Joi.when('attachment1', {
      is: null,
      then: null,
      otherwise: Joi.string().regex(REGEX.S3_KEY).allow(null).required(),
    }).error(new CustomError('INVALID_ATTACHMENT')),
    attachment3: Joi.when('attachment2', {
      is: null,
      then: null,
      otherwise: Joi.string().regex(REGEX.S3_KEY).allow(null).required(),
    }).error(new CustomError('INVALID_ATTACHMENT')),
    appVersion: Joi.string()
      .max(100)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_VERSION')),
    os: Joi.string().max(100).allow(null).required().error(new CustomError('INVALID_OS')),
    deviceModel: Joi.string()
      .max(100)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_DEVICE_MODEL')),
    osVersion: Joi.string()
      .max(100)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_VERSION')),
  }),
}).unknown(true);

exports.pageInfoSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).error(new CustomError('INVALID_PAGE')),
    pageSize: Joi.number().integer().min(0).error(new CustomError('INVALID_PAGE_SIZE')),
  }).unknown(true),
}).unknown(true);

exports.updateFavoriteSchema = Joi.object({
  body: Joi.object({
    placeId: Joi.string()
      .max(65535)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_PLACE_ID')),
  }),
}).unknown(true);

exports.createShipmentSchema = Joi.object({
  body: Joi.object({
    shipmentType: Joi.string()
      .valid(...Object.keys(SHIPMENT_TYPE))
      .required()
      .error(new CustomError('INVALID_SHIPMENT_TYPE')),
    vehicleType: Joi.string()
      .allow(null)
      .valid(...Object.keys(VEHICLE_TYPE))
      .error(new CustomError('INVALID_VEHICLE_TYPE')),
    reqDatetime: Joi.date().iso().required().error(new CustomError('INVALID_REQUEST_DATETIME')),
    pickup: Joi.object({
      location: Joi.string().max(100).required().error(new CustomError('INVALID_PICKUP_LOCATION')),
      address: Joi.string().max(200).required().error(new CustomError('INVALID_PICKUP_ADDRESS')),
      addressDetail: Joi.string()
        .allow(null)
        .max(100)
        .required()
        .error(new CustomError('INVALID_PICKUP_ADDRESS_DETAIL')),
      coord: {
        x: Joi.number()
          .min(-180)
          .max(180)
          .required()
          .error(new CustomError('INVALID_PICKUP_LONGITUDE')),
        y: Joi.number()
          .min(-90)
          .max(90)
          .required()
          .error(new CustomError('INVALID_PICKUP_LATITUDE')),
      },
      placeId: Joi.string().max(65535).error(new CustomError('INVALID_PICKUP_PLACE_ID')),
      countryCode: Joi.string()
        .pattern(/^[A-Z]{2}$/)
        .required()
        .error(new CustomError('INVALID_PICKUP_COUNTRY_CODE')),
      phone: Joi.string()
        .pattern(/^\d{10,15}$/)
        .required()
        .error(new CustomError('INVALID_PICKUP_PHONE_NUMBER')),
      name: Joi.string().max(100).required().error(new CustomError('INVALID_PICKUP_NAME')),
    }).unknown(true),
    dropoff: Joi.object({
      location: Joi.string().max(100).required().error(new CustomError('INVALID_DROPOFF_LOCATION')),
      address: Joi.string().max(200).required().error(new CustomError('INVALID_DROPOFF_ADDRESS')),
      addressDetail: Joi.string()
        .allow(null)
        .max(100)
        .required()
        .error(new CustomError('INVALID_DROPOFF_ADDRESS_DETAIL')),
      coord: {
        x: Joi.number()
          .min(-180)
          .max(180)
          .required()
          .error(new CustomError('INVALID_DROPOFF_LONGITUDE')),
        y: Joi.number()
          .min(-90)
          .max(90)
          .required()
          .error(new CustomError('INVALID_DROPOFF_LATITUDE')),
      },
      placeId: Joi.string().max(65535).error(new CustomError('INVALID_DROPOFF_PLACE_ID')),
      countryCode: Joi.string()
        .pattern(/^[A-Z]{2}$/)
        .required()
        .error(new CustomError('INVALID_DROPOFF_COUNTRY_CODE')),
      phone: Joi.string()
        .pattern(/^\d{10,15}$/)
        .required()
        .error(new CustomError('INVALID_DROPOFF_PHONE_NUMBER')),
      name: Joi.string().max(100).required().error(new CustomError('INVALID_DROPOFF_NAME')),
    }).unknown(true),
    package: Joi.object({
      itemType: Joi.string()
        .required()
        .valid(...Object.keys(ITEM_TYPE))
        .error(new CustomError('INVALID_ITEM_TYPE')),
      name: Joi.string().allow(null).max(100).error(new CustomError('INVALID_PACKAGE_NAME')),
      weight: Joi.number()
        .integer()
        .max(50)
        .required()
        .error(new CustomError('INVALID_PACKAGE_WEIGHT')),
      isPacked: Joi.number()
        .integer()
        .min(0)
        .max(1)
        .required()
        .error(new CustomError('INVALID_PACKAGING')),
      photo: Joi.string().pattern(REGEX.S3_KEY).error(new CustomError('INVALID_PACKAGE_PHOTO')),
      memo: Joi.string().allow(null).max(200).error(new CustomError('INVALID_MEMO')),
    }).unknown(true),
    packaging: Joi.when(Joi.ref('package.isPacked'), {
      is: 1,
      then: Joi.object({
        vinyl: Joi.number().min(0).max(1),
        box1: Joi.number().min(0).max(10),
        box2: Joi.number().min(0).max(10),
        box3: Joi.number().min(0).max(10),
        box4: Joi.number().min(0).max(10),
      }).required(),
      otherwise: null,
    }),
    payment: Joi.object({
      type: Joi.string()
        .valid(...Object.keys(PAYMENT_TYPE))
        .required()
        .error(new CustomError('INVALID_PAYMENT_TYPE')),
      currency: Joi.string()
        .pattern(/^[A-Z]{3}$/)
        .required()
        .error(new CustomError('INVALID_CURRENCY')),
      cost: Joi.number()
        .integer()
        .max(9223372036854775807)
        .required()
        .error(new CustomError('INVALID_COST')),
      levelDiscount: Joi.number()
        .integer()
        .max(9223372036854775807)
        .required()
        .error(new CustomError('INVALID_DISCOUNT')),
      couponDiscount: Joi.number()
        .integer()
        .max(9223372036854775807)
        .required()
        .error(new CustomError('INVALID_DISCOUNT')),
      couponCode: Joi.string()
        .pattern(/^[A-Z0-9]{10}$/)
        .error(new CustomError('INVALID_COUPON_CODE')),
      cardId: Joi.when('paymentType', {
        is: 'card',
        then: Joi.string().uuid().required().error(new CustomError('INVALID_CREDIT_CARD_ID')),
      }),
      vendor: Joi.when('paymentType', {
        is: 'card',
        then: Joi.string().max(100).error(new CustomError('INVALID_VENDOR')),
      }),
      cardNumber: Joi.when('paymentType', {
        is: 'card',
        then: Joi.string().error(new CustomError('INVALID_CREDIT_CARD_NUMBER')),
      }),
    }).unknown(true),
  }).unknown(true),
}).unknown(true);

exports.estimateShipmentSchema = Joi.object({
  body: Joi.object({
    shipmentType: Joi.string()
      .valid(...Object.keys(SHIPMENT_TYPE))
      .required()
      .error(new CustomError('INVALID_SHIPMENT_TYPE')),
    vehicleType: Joi.string()
      .allow(null)
      .valid(...Object.keys(VEHICLE_TYPE))
      .error(new CustomError('INVALID_VEHICLE_TYPE')),
    reqDatetime: Joi.date().iso().required().error(new CustomError('INVALID_REQUEST_DATETIME')),
    dropoffCoord: Joi.object({
      x: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .error(new CustomError('INVALID_DROPOFF_LATITUDE')),
      y: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .error(new CustomError('INVALID_DROPOFF_LONGITUDE')),
    }),
    pickupCoord: Joi.object({
      x: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .error(new CustomError('INVALID_PICKUP_LATITUDE')),
      y: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .error(new CustomError('INVALID_PICKUP_LONGITUDE')),
    }),
    packageWeight: Joi.number()
      .min(0)
      .max(50)
      .required()
      .error(new CustomError('INVALID_PACKAGE_WEIGHT')),
    currency: Joi.string()
      .pattern(/^[A-Z]{3}$/)
      .required()
      .error(new CustomError('INVALID_CURRENCY')),
    couponCode: Joi.string()
      .pattern(/^[A-Z0-9]{10}$/)
      .error(new CustomError('INVALID_COUPON_CODE')),
    itemType: Joi.string()
      .required()
      .valid(...Object.keys(ITEM_TYPE))
      .error(new CustomError('INVALID_ITEM_TYPE')),
  }).unknown(true),
}).unknown(true);

exports.listShipmentsSchema = Joi.object({
  query: Joi.object({
    shipmentStatus: Joi.string()
      .valid(...Object.keys(SHIPMENT_STATUS))
      .error(new CustomError('INVALID_SHIPMENT_STATUS')),
    shipmentType: Joi.string()
      .valid(...Object.keys(SHIPMENT_TYPE))
      .error(new CustomError('INVALID_SHIPMENT_TYPE')),
    from: Joi.date().iso().error(new CustomError('INVALID_FROM_DATETIME')),
    to: Joi.date().iso().error(new CustomError('INVALID_TO_DATETIME')),
    no: Joi.string()
      .pattern(/^(K|E|L)?\d{0,15}$/)
      .error(new CustomError('INVALID_SHIPMENT_NUMBER')),
    orderBy: Joi.string().valid('asc', 'desc').error(new CustomError('INVALID_ORDER_BY')),
    nextCursor: Joi.string()
      .pattern(/^\d+(\,\d+)$/)
      .error(new CustomError('INVALID_NEXT_CURSOR')),
    itemCount: Joi.number().integer().min(0).error(new CustomError('INVALID_ITEM_COUNT')),
  }).unknown(true),
}).unknown(true);

exports.updateShipmentSchema = Joi.object({
  body: Joi.object({
    reqDatetime: Joi.date().iso().required().error(new CustomError('INVALID_REQUEST_DATETIME')),
  }).unknown(true),
}).unknown(true);

exports.cancelShipmentSchema = Joi.object({
  body: Joi.object({
    cancelReason: Joi.string().max(200).required().error(new CustomError('INVALID_CANCEL_REASON')),
  }).unknown(true),
}).unknown(true);

exports.addCardSchema = Joi.object({
  body: Joi.object({
    number: Joi.string()
      .pattern(/^\d{10,20}$/)
      .required()
      .error(new CustomError('INVALID_CREDIT_CARD_NUMBER')),
    expiryYear: Joi.string()
      .pattern(/^\d{2}$/)
      .required()
      .error(new CustomError('INVALID_EXPIRY_YEAR')),
    expiryMonth: Joi.string()
      .pattern(/^(0[1-9]|1[0-2])$/)
      .required()
      .error(new CustomError('INVALID_EXPIRY_MONTH')),
    csc: Joi.string().min(3).max(4).required().error(new CustomError('INVALID_CARD_SECURITY_CODE')),
    vendor: Joi.string().max(100).required().error(new CustomError('INVALID_VENDOR')),
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .required()
      .error(new CustomError('INVALID_COUNTRY_CODE')),
  }).unknown(true),
}).unknown(true);

exports.putProfileImageSchema = Joi.object({
  body: Joi.object({
    profileImage: Joi.string()
      .pattern(REGEX.S3_KEY)
      .required()
      .error(new CustomError('INVALID_PROFILE_IMAGE')),
  }).unknown(true),
}).unknown(true);

exports.updateFcmTokenSchema = Joi.object({
  body: Joi.object({
    fcmToken: Joi.string()
      .max(255)
      .allow(null)
      .required()
      .error(new CustomError('INVALID_FCM_TOKEN')),
  }),
}).unknown(true);

exports.putLangCodeSchema = Joi.object({
  body: Joi.object({
    langCode: Joi.string().required().error(new CustomError('INVALID_LANG_CODE')),
  }),
}).unknown(true);

exports.deleteShipperSchema = Joi.object({
  body: Joi.object({
    password: Joi.string().max(255).required().error(new CustomError('INVALID_PASSWORD')),
    reason: Joi.string().max(200).required().error(new CustomError('INVALID_DELETE_REASON')),
  }),
}).unknown(true);

exports.updateHelpSchema = Joi.object({
  body: Joi.object({
    type: Joi.string()
      .valid(...Object.keys(HELP_TYPE))
      .error(new CustomError('INVALID_HELP_TYPE')),
    shipmentId: Joi.string()
      .when('type', {
        is: Joi.valid('order'),
        then: Joi.string().uuid().allow(null).required(),
        otherwise: null,
      })
      .error(new CustomError('INVALID_ID')),
    subject: Joi.string().max(50).error(new CustomError('INVALID_SUBJECT')),
    description: Joi.string().max(200).error(new CustomError('INVALID_DISCRIPTION')),
    attachment1: Joi.string()
      .pattern(REGEX.S3_KEY)
      .allow(null)
      .error(new CustomError('INVALID_ATTACHMENT')),
    attachment2: Joi.string()
      .pattern(REGEX.S3_KEY)
      .allow(null)
      .error(new CustomError('INVALID_ATTACHMENT')),
    attachment3: Joi.string()
      .pattern(REGEX.S3_KEY)
      .allow(null)
      .error(new CustomError('INVALID_ATTACHMENT')),
    appVersion: Joi.string().max(100).allow(null).error(new CustomError('INVALID_APP_VERSION')),
    deviceModel: Joi.string().max(100).allow(null).error(new CustomError('INVALID_DEVICE_MODEL')),
    os: Joi.string().max(100).allow(null).error(new CustomError('INVALID_OS')),
    osVersion: Joi.string().max(100).allow(null).error(new CustomError('INVALID_OS_VERSION')),
  }),
}).unknown(true);

exports.listCouponSchema = Joi.object({
  query: Joi.object({
    status: Joi.string().valid('active', 'expired').error(new CustomError('INVALID_COUPON_STATUS')),
    nextCursor: Joi.string()
      .pattern(/^\d+(\,\d+)$/)
      .error(new CustomError('INVALID_NEXT_CURSOR')),
    itemCount: Joi.number().integer().min(0).error(new CustomError('INVALID_ITEM_COUNT')),
  }),
}).unknown(true);

exports.registerCouponSchema = Joi.object({
  body: Joi.object({
    code: Joi.string()
      .pattern(/^[A-Z0-9]{10}$/)
      .error(new CustomError('INVALID_COUPON_CODE')),
  }),
}).unknown(true);

exports.postClaimSchema = Joi.object({
  body: Joi.object({
    type: Joi.string()
      .valid(...Object.keys(CLAIM_TYPE))
      .required()
      .error(new CustomError('INVALID_CLAIM_TYPE')),
    description: Joi.string().max(300).required().error(new CustomError('INVALID_DESCRIPTION')),
    phone: Joi.string()
      .pattern(/\d{10,15}/)
      .required()
      .error(new CustomError('INVALID_PHONE_NUMBER')),
    deliveryDate: Joi.date().iso().required().error(new CustomError('INVALID_DELIVERY_DATETIME')),
    name: Joi.string().max(100).required().error(new CustomError('INVALID_NAME')),
    countryCode: Joi.string()
      .pattern(/^[A-Z]{2}$/)
      .required()
      .error(new CustomError('INVALID_COUNTRY_CODE')),
  }),
}).unknown(true);

exports.notificationSchema = Joi.object({
  body: Joi.object({
    marketing: Joi.number()
      .integer()
      .min(0)
      .max(1)
      .error(new CustomError('INVALID_MARKETING_NOTI_TYPE')),
  }).unknown(true),
}).unknown(true);
