var express = require('express');
var router = express.Router();
const db = require('../models/db');
const islogined = require('../models/logincheck');
const request = require('request');
const multer = require('multer');
const path = require('path');

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
    res.cookie('email', result.email);
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
  const image = `/uploads/${req.file.filename}`;

  console.log(user, title, content, req.file.filename);

  if (user && title && content) {
    db.report(user, title, content, image);
    res.status(200).send('report success');
  } else {
    res.status(401).send('report fail');
  }
});

router.get('/poi', (req, res) => {
  var url =
    'https://apis.openapi.sk.com/tmap/pois?version=1&format=json&callback=result';
  var queryParams =
    '&' + encodeURIComponent('page') + '=' + encodeURIComponent(parseInt('1'));

  queryParams +=
    '&' +
    encodeURIComponent('searchKeyword') +
    '=' +
    encodeURIComponent(req.body.searchKeyword);

  queryParams +=
    '&' + encodeURIComponent('areaLLCode') + '=' + encodeURIComponent('서울');

  queryParams +=
    '&' +
    encodeURIComponent('appKey') +
    '=' +
    encodeURIComponent(`${process.env.TMAP_KEY}`);
  console.log(url + queryParams);
  request(
    {
      url: url + queryParams,
      method: 'GET',
    },
    function (error, res, body) {
      console.log(res.searchPoiInfo);
    }
  );
  res.status(200).send('Poi success');
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
        timeout: 5000,
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
router.get('/poisearch', async (req, res) => {
  let coordinates = [{}];
  let passLists;
  for (let i = 0; i < 5; i++) {
    let tmp = await callbackLatLon(
      req.body.fromLat,
      req.body.fromLon,
      req.body.toLat,
      req.body.toLon,
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
      startX: req.body.fromLon,
      startY: req.body.fromLat,
      angle: 20,
      speed: 30,
      endX: req.body.toLon,
      endY: req.body.toLat,
      searchOption: 4,
      appkey: process.env.TMAP_KEY,
      reqCoordType: 'WGS84GEO',
      startName: encodeURIComponent(`${req.body.startName}`),
      endName: encodeURIComponent(`${req.body.endName}`),
      passList: passLists,
    },
  };
  request.post(options, function (err, result, body) {
    res.status(200).send(result);
  });
});

module.exports = router;
