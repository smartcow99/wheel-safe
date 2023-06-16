const CustomError = require('./CustomError');

exports.ALPHANUM = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
exports.ALPHABET = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
exports.NUMBER = [...'0123456789'];
exports.SPECIAL = [...`\`~!@#$%^&*()-_=+{}[]|\\:;'",./?`];
exports.REGEX = {
  IMAGE: /^image\//,
  JWT: /^[\w\W]*\.[\w\W]*\.[\w\W]*$/,
  UUID: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', // 라우트 경로 정규식
  S3_KEY:
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpe?g|jfif|exif|gif|bmp|png|p[pgbn]m|hdr|pdf|heic)$/,
  NO: '[K|E|L][0-9]{0,15}', // 라우트 경로 정규식
};

/**
 * @description 배열 안의 원소들을 무작위로 섞어주는 함수
 */
exports.shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * @description 임의의 문자열을 생성하는 함수
 */
exports.getRandomString = strLength => {
  return [...Array(strLength)]
    .map(() => this.ALPHANUM[Math.trunc(Math.random() * this.ALPHANUM.length)])
    .join('');
};

/**
 * @description 임의의 숫자를 생성하는 함수
 */
exports.getRandomNumber = (strLength = 6) => {
  strLength = parseInt(strLength);
  if (isNaN(strLength)) return;
  return (
    Math.floor(Math.random() * (Math.pow(10, strLength) - Math.pow(10, strLength - 1))) +
    Math.pow(10, strLength - 1)
  );
};

/**
 * @description 임시 비밀번호를 생성하는 함수
 * 문자, 숫자, 특수문자 각 최소 하나 포함 8~16자 생성
 * 문자 2 : 숫자 1 : 특수문자 1 의 비율로 생성
 */
exports.getRandomPassword = strLength => {
  const alphaLength = Math.floor(strLength * 0.5);
  const numberLength = Math.floor(strLength * 0.25);

  const newAlpha = [...Array(alphaLength)]
    .map(() => this.ALPHABET[Math.floor(Math.random() * this.ALPHABET.length)])
    .join('');

  const newNumber = [...Array(numberLength)]
    .map(() => this.NUMBER[Math.floor(Math.random() * this.NUMBER.length)])
    .join('');

  const newSpecial = [...Array(numberLength)]
    .map(() => this.SPECIAL[Math.floor(Math.random() * this.SPECIAL.length)])
    .join('');

  const newPassword = newAlpha + newNumber + newSpecial;
  return this.shuffle([...newPassword]).join('');
};

/**
 * @description 인증코드 생성 함수
 */
exports.getRandomAuthCode = strLength => {
  return [...Array(strLength)]
    .map(() => this.NUMBER[Math.trunc(Math.random() * this.NUMBER.length)])
    .join('');
};

/**
 * @description 페이지네이션 정보를 반환하는 함수
 * @param {number} totalCount 전체 데이터 개수
 * @param {number} requestedPage 현재 페이지
 * @param {number} perPage 한 페이지에 보여줄 데이터 개수
 */
exports.getPageInfo = (totalCount = 0, requestedPage = 1, perPage = 10) => {
  const totalData = Number(totalCount);
  const currentPage = Number(requestedPage);
  const dataPerPage = Number(perPage);
  const totalPages = Math.ceil(totalData / perPage);
  const startRow = currentPage > 1 ? currentPage * perPage - perPage : 0;
  return {
    totalData, // the number of data
    currentPage, // current page number
    dataPerPage, // the number of data per page
    totalPages, // the number of total pages
    startRow, // SQL LIMIT offset
  };
};

/**
 *
 * @param {Float} fromLat 출발지 위도
 * @param {Float} fromLon 출발지 경도
 * @param {Float} toLat 도착지 위도
 * @param {Float} toLon 도착지 경도
 * @param {Integer} num 반복 횟수
 */
exports.callbackLatLon = (fromLat, fromLon, toLat, toLon, num) => {
  const url =
    'https://apis.openapi.sk.com/tmap/pois/search/around?version=1&format=json&callback=result';
  let queryParmas = '&' + encodeURIComponent('categories') + '=' + encodeURIComponent('초등학교');
  queryParmas +=
    '&' + encodeURIComponent('appKey') + '=' + encodeURIComponent(`${process.env.TMAP_KEY}`);
  queryParmas += '&' + encodeURIComponent('count') + '=' + encodeURIComponent('1');
  queryParmas += '&' + encodeURIComponent('radius') + '=' + encodeURIComponent('1');

  const maps = {
    lon: [
      (fromLon * 1 + toLon * 5) / 6,
      (fromLon * 2 + toLon * 4) / 6,
      (fromLon * 3 + toLon * 3) / 6,
      (fromLon * 4 + toLon * 2) / 6,
      (fromLon * 5 + toLon * 1) / 6,
    ],
    lat: [
      (fromLat * 1 + toLat * 5) / 6,
      (fromLat * 2 + toLat * 4) / 6,
      (fromLat * 3 + toLat * 3) / 6,
      (fromLat * 4 + toLat * 2) / 6,
      (fromLat * 5 + toLat * 1) / 6,
    ],
  };

  let qp = queryParmas;
  qp +=
    '&' +
    encodeURIComponent('centerLon') +
    '=' +
    encodeURIComponent(`${parseFloat(maps.lon[num])}`);
  qp +=
    '&' +
    encodeURIComponent('centerLat') +
    '=' +
    encodeURIComponent(`${parseFloat(maps.lat[num])}`);

  return new Promise((resolve, reject) => {
    let resultJson = {};
    request(
      {
        url: url + qp,
        method: 'GET',
      },

      function (err, res, body) {
        if (!err && res.statusCode === 200) {
          resultJson = JSON.parse(body);
          resolve(resultJson);
        } else {
          resultJson['error'] = 'Some error';
          reject(resultJson);
        }
      }
    );
  });
};

/**
 * @param {Float} lat 위도
 * @param {Float} lon 경도
 */
exports.findgu = (lat, lon) => {
  const url = 'https://apis.openapi.sk.com/tmap/geo/reversegeocoding?version={version}';

  let queryParams = '&' + encodeURIComponent('lat') + '=' + lat;
  queryParams += '&' + encodeURIComponent('lon') + '=' + lon;
  queryParams += '&' + encodeURIComponent('appKey') + '=' + `${process.env.TMAP_KEY}`;

  return new Promise((resolve, reject) => {
    let resultJson = {};
    request(
      {
        url: url + queryParams,
        method: 'GET',
      },

      function (err, res, body) {
        if (!err && res.statusCode === 200) {
          resultJson = JSON.parse(body);
          resolve(resultJson);
        } else {
          resultJson['error'] = 'Some error';
          reject(resultJson);
        }
      }
    );
  });
};
