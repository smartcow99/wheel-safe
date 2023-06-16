const { request } = require('express');
const { callbackLatLon, findgu } = require('../../utils');
const { ELECTRONIC_CHARGER_LOCATIONS } = require('../../utils/category');
const CustomError = require('../../utils/CustomError');

exports.getLocationService = async (trx, { fromLat, fromLon, toLat, toLon }) => {
  const coordinates = [];
  for (let i = 0; i < 5; i++) {
    const tmp = await callbackLatLon(fromLat, fromLon, toLat, toLon, i);
    coordinates.push({
      lat: tmp.searchPoiInfo.pois.poi[0].frontLat,
      lon: tmp.searchPoiInfo.pois.poi[0].fromLon,
    });
  }
  const ori_x = fromLon - toLon;
  const ori_y = fromLat - toLat;
  const dis_u = Math.sqrt(ori_x * ori_x + ori_y * ori_y);
  const norm_x = ori_x / dis_u;
  const norm_y = ori_y / dis_u;
  return { coordinates, norm_x, norm_y };
};

exports.getPoisearchService = async (coordinates, norm_x, norm_y) => {
  const lonArr = [];
  const latArr = [];
  for (let i = 1; i < 6; i++) {
    if (Object.keys(coordinates[i]).length != 0) {
      let dif_x, dif_y;
      if (i == 1) {
        dif_x = fromLon - coordinates[i].lon;
        dif_y = fromLat - coordinates[i].lat;
      } else {
        dif_x = coordinates[i - 1].lon - coordinates[i].lon;
        dif_y = coordinates[i - 1].lat - coordinates[i].lon;
      }
      const dis_v = Math.sqrt(dif_x * dif_x + dif_y * dif_y);
      const norm_x2 = dif_x / dis_v;
      const norm_y2 = dif_y / dis_v;
      let theta = norm_x * norm_x2 + norm_y * norm_y2;
      theta = Math.acos(theta);
      const degree = theta * (180 / 3.141592);
      if (degree < 20) {
        lonArr.push(coordinates[i].lon);
        latArr.push(coordinates[i].lat);
      }
    }
  }
  const lonSet = new Set(lonArr);
  const latSet = new Set(latArr);
  lonArr = Array.from(lonSet);
  latArr = Array.from(latSet);

  for (let i = 0; i < lonArr.length; i++) {
    passLists += lonArr[i] + ',' + latArr[i] + '_';
  }
  return passLists.substring(0, passLists.length - 1);
};
exports.postPoiOptionService = async (
  passLists,
  fromLat,
  fromLon,
  toLat,
  toLon,
  startName,
  endName
) => {
  const options = {
    uri: process.env.TMAP_URL,
    method: 'POST',
    form: {
      startX: fromLon,
      startY: fromLat,
      angle: 10,
      speed: 4,
      endX: toLon,
      endY: toLat,
      searchOption: 4,
      appkey: process.env.TMAP_KEY,
      reqCoordType: 'WGS84GEO',
      startName: encodeURIComponent(`${startName}`),
      endName: encodeURIComponent(`${endName}`),
      passList: passLists,
    },
  };

  request.post(options, function (err, response, body) {
    let result = JSON.parse(body);
    return result;
  });
};

exports.getElectronicService = async (lat, lon) => {
  const fg = await findgu(lat, lon);
  const signgu = fg.addressInfo.gu_gun;

  let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + `${process.env.OPEN_KEY}`;
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('0');
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('5');
  queryParams += '&' + encodeURIComponent('type') + '=' + encodeURIComponent('json');
  queryParams += '&' + encodeURIComponent('ctprvnNm') + '=' + encodeURIComponent('서울특별시');
  queryParams += '&' + encodeURIComponent('signguNm') + '=' + encodeURIComponent(`${signgu}`);

  if (signgu === '동작구') {
    resultJson = {
      response: {
        body: {
          items: ELECTRONIC_CHARGER_LOCATIONS,
        },
      },
    };
    return resultJson;
  } else {
    request(
      {
        url: process.env.ELECTRONIC_URL + queryParams,
        method: 'GET',
      },
      function (err, response, body) {
        if (!err && res.statusCode === 200) {
          return JSON.parse(body);
        } else {
          throw new CustomError('GET_ELECTRONIC_CHARGE_FAILED');
        }
      }
    );
  }
};
