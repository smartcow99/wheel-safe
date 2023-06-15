const crypto = require('crypto');
const redis = require('../database/redis');
const { REGEX } = require('../utils');
const CustomError = require('../utils/CustomError');

/**
 * JWT 생성 후 Redis 등록
 * @param {string} tokenType 종류(access, refresh)
 * @param {string} domain 프로젝트 도메인(driver, shipper, etc.)
 * @param {string} userId 사용자 UUID
 * @param {string} client 클라이언트 종류(app, web)
 * @param {number} ttl 유효시간
 * @param {string} scope 권한 범위
 * @returns {string} JWT
 */
exports.createToken = async (tokenType, domain, userId, client, scope) => {
  // JWT 생성
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const encodedHeader = Buffer.from(JSON.stringify(header), 'utf8')
    .toString('base64')
    .replace(/\=/g, '');
  const encodedPayload = Buffer.from(
    JSON.stringify({
      token: tokenType,
      sub: domain,
      uid: userId,
      clt: client,
      exp:
        Date.now() +
        parseInt(
          tokenType === 'refresh'
            ? process.env.REDIS_REFRESH_TOKEN_TTL
            : process.env.REDIS_ACCESS_TOKEN_TTL
        ) *
          1000,
      scope,
    }),
    'utf8'
  )
    .toString('base64')
    .replace(/\=/g, '');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(encodedHeader + '.' + encodedPayload)
    .digest('base64')
    .replace(/\=/g, '');
  const token = encodedHeader + '.' + encodedPayload + '.' + signature;

  // Redis 등록
  const redisKey = `${domain}:${userId}:${client}:${tokenType}`;
  await redis.SETEX(
    redisKey,
    parseInt(
      tokenType === 'refresh'
        ? process.env.REDIS_REFRESH_TOKEN_TTL
        : process.env.REDIS_ACCESS_TOKEN_TTL
    ),
    token
  );

  return token;
};

/**
 * JWT 검증
 * @param {string} token JWT
 * @returns {string} JWT payload
 */
exports.validateToken = async (token, refresh = false) => {
  if (!token.match(REGEX.JWT))
    throw new CustomError(`INVALID_${refresh ? 'REFRESH' : 'ACCESS'}_TOKEN`, 401);
  const [header, payload, signature] = token.split('.');
  const testSignature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(header + '.' + payload)
    .digest('base64')
    .replace(/\=/g, '');

  /* 조작된 토큰에 대해서는 별도 처리없이 접근 거부 응답 */
  if (testSignature !== signature)
    throw new CustomError(`INVALID_${refresh ? 'REFRESH' : 'ACCESS'}_TOKEN`, 401);

  const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  /* 토큰 종류 검증 */
  if (
    (refresh && decodedPayload.token !== 'refresh') ||
    (!refresh && decodedPayload.token !== 'access')
  )
    throw new CustomError(`INVALID_${refresh ? 'REFRESH' : 'ACCESS'}_TOKEN`, 401);

  /* Redis 등록 토큰 검증 */
  const redisData = await redis.GET(
    `${decodedPayload.sub}:${decodedPayload.uid}:${decodedPayload.clt}:${decodedPayload.token}`
  );
  if (!redisData || decodedPayload.exp < Date.now()) {
    throw new CustomError(`INVALID_${refresh ? 'REFRESH' : 'ACCESS'}_TOKEN`, 401);
  } else if (redisData !== token) {
    throw new CustomError('DUPLICATE_SIGNIN_DETECTED', 401);
  }

  return decodedPayload;
};
