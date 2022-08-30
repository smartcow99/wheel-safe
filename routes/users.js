var express = require('express');
var router = express.Router();
const db = require('../models/db');
const islogined = require('../models/logincheck');
const request = require('request');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/login', async (req, res) => {
  const [result] = await db.login(req.body.email, req.body.password);
  console.log(result);
  console.log(req.body.email, req.body.password);
  if (result && result.email) {
    req.session.islogined = true;
    req.session.email = result.email;
    res.cookie('email', result.email, { maxAge: 100000000 });
    console.log(
      `islogined session : ${req.session.islogined} \nemail session: ${req.session.email}`
    );
    res.status(200).send('login success');
  } else {
    res.status(401).send('login fail');
  }
});

router.post('/register', async (req, res) => {
  const [isMember] = await db.isMember(req.body.email);
  console.log(isMember);
  console.log(req.body.email, req.body.password);

  if (isMember) {
    res.status(401).send('register fail');
  } else {
    db.register(req.body.email, req.body.password);
    res.status(200).send('register success');
  }
});

router.get('/logout', islogined, (req, res) => {
  req.session.destroy(function () {
    req.session;
  });
  res.clearCookie('email');
  res.status(200).send('logout success');
});

router.post('/report', upload.single('image'), async (req, res) => {
  const user = req.cookies.email;
  const title = req.body.title;
  const content = req.body.content;
  const addr = req.body.address;
  const image = `/uploads/${req.file.filename}`;

  console.log(user, title, content, req.file.filename);

  if (user && title && content && addr) {
    db.report(user, title, addr, content, image);
    res.status(200).send('report success');
  } else {
    res.status(401).send('report fail');
  }
});

router.get('/reports', async (req, res) => {
  const user = req.cookies.email;
  const [...result] = await db.reports(user);
  console.log(user);
  if (result) {
    console.log(result);
    res.status(200).send(result);
  } else {
    res.status(401).send('reports fail or nothing');
  }
});

/**
 *
 * @param {Float} fromLat 출발지 위도
 * @param {Float} fromLon 출발지 경도
 * @param {Float} toLat 도착지 위도
 * @param {Float} toLon 도착지 경도
 * @param {Integer} num 반복 횟수
 */
async function callbackLatLon(fromLat, fromLon, toLat, toLon, num) {
  const url =
    'https://apis.openapi.sk.com/tmap/pois/search/around?version=1&format=json&callback=result';
  let queryParmas =
    '&' +
    encodeURIComponent('categories') +
    '=' +
    encodeURIComponent('초등학교');
  queryParmas +=
    '&' +
    encodeURIComponent('appKey') +
    '=' +
    encodeURIComponent(`${process.env.TMAP_KEY}`);
  queryParmas +=
    '&' + encodeURIComponent('count') + '=' + encodeURIComponent('1');
  queryParmas +=
    '&' + encodeURIComponent('radius') + '=' + encodeURIComponent('1');

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
          console.log(err);

          resultJson['error'] = 'Some error';
          reject(resultJson);
        }
      }
    );
  });
}

router.get('/poisearch', async (req, res) => {
  let coordinates = [{}];
  let passLists;
  for (let i = 0; i < 5; i++) {
    let tmp = await callbackLatLon(
      req.query.fromLat,
      req.query.fromLon,
      req.query.toLat,
      req.query.toLon,
      i
    );
    coordinates.push({
      lat: tmp.searchPoiInfo.pois.poi[0].frontLat,
      lon: tmp.searchPoiInfo.pois.poi[0].frontLon,
    });
  }
  console.log(coordinates);
  for (let i = 1; i < 6; i++) {
    if (Object.keys(coordinates[i]).length != 0) {
      passLists += coordinates[i].lon + ',' + coordinates[i].lat + '_';
    }
  }

  passLists = passLists.substring(9, passLists.length - 1);

  let options = {
    uri: 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version={version}&callback={callback}',
    method: 'POST',
    form: {
      startX: req.query.fromLon,
      startY: req.query.fromLat,
      angle: 20,
      speed: 30,
      endX: req.query.toLon,
      endY: req.query.toLat,
      searchOption: 4,
      appkey: process.env.TMAP_KEY,
      reqCoordType: 'WGS84GEO',
      startName: encodeURIComponent(`${req.query.startName}`),
      endName: encodeURIComponent(`${req.query.endName}`),
      passList: passLists,
    },
  };
  request.post(options, function (err, response, body) {
    let result = JSON.parse(body);
    res.status(200).send(result);
  });
});

router.get('/electric', async (req, res) => {
  let fg = await findgu(req.query.lat, req.query.lon);
  // console.log(fg);
  let signgu = fg.addressInfo.gu_gun;

  const url =
    'http://api.data.go.kr/openapi/tn_pubr_public_electr_whlchairhgh_spdchrgr_api';
  let queryParams =
    '?' + encodeURIComponent('serviceKey') + '=' + `${process.env.OPEN_KEY}`;
  queryParams +=
    '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('0');
  queryParams +=
    '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('5');
  queryParams +=
    '&' + encodeURIComponent('type') + '=' + encodeURIComponent('json');
  queryParams +=
    '&' +
    encodeURIComponent('ctprvnNm') +
    '=' +
    encodeURIComponent('서울특별시');
  queryParams +=
    '&' +
    encodeURIComponent('signguNm') +
    '=' +
    encodeURIComponent(`${signgu}`);

  request(
    {
      url: url + queryParams,
      method: 'GET',
    },
    function (err, response, body) {
      if (!err && res.statusCode === 200) {
        resultJson = JSON.parse(body);
        console.log(resultJson);
        res.status(200).send(resultJson);
      } else {
        res.status(401).send('error');
      }
    }
  );
});

/**
 * @param {Float} lat 위도
 * @param {Float} lon 경도
 */
async function findgu(lat, lon) {
  const url =
    'https://apis.openapi.sk.com/tmap/geo/reversegeocoding?version={version}';

  let queryParams = '&' + encodeURIComponent('lat') + '=' + lat;
  queryParams += '&' + encodeURIComponent('lon') + '=' + lon;
  queryParams +=
    '&' + encodeURIComponent('appKey') + '=' + `${process.env.TMAP_KEY}`;

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
}

module.exports = router;
