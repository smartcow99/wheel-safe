var express = require('express');
var router = express.Router();
const db = require('../models/db');
const islogined = require('../models/logincheck');
const request = require('request');


router.post('/login', async (req, res) =>{
    const [result]  = await db.login(req.body.email, req.body.password);
    console.log(result);
    console.log(req.body.email, req.body.password);
    if(result && result.email){
        req.session.islogined = true;
        req.session.email = result.email;
        res.cookie('email', result.email);
        console.log(`islogined session : ${req.session.islogined} \nemail session: ${req.session.email}`);
        res.status(200).send('login success');
    }
    else{
        res.status(401).send('login fail');
    }
});

router.post('/register', async (req, res)=>{
    const [isMember] = await db.isMember(req.body.email);
    console.log(isMember);
    console.log(req.body.email, req.body.password);
    
    if(isMember){
        res.status(401).send('register fail');
    }
    else{
        db.register(req.body.email, req.body.password);
        res.status(200).send('register success');
    }
})

router.get('/logout', islogined, (req,res)=>{
    req.session.destroy(function(){
        req.session;
    });
    res.clearCookie('email');
    res.status(200).send('logout success');
    
})

router.get('/poi', (req,res)=>{
    var url = 'https://apis.openapi.sk.com/tmap/pois?version=1&format=json&callback=result';
    var queryParams =
    '&' +
    encodeURIComponent('page') +
    '=' +
    encodeURIComponent(parseInt("1"));

    queryParams += 
    '&' +
    encodeURIComponent('searchKeyword') +
    '=' +
    encodeURIComponent(req.body.searchKeyword);

    queryParams +=
    '&' +
    encodeURIComponent('areaLLCode') +
    '=' +
    encodeURIComponent('서울');

    queryParams +=
    '&' +
    encodeURIComponent('appKey') +
    '=' +
    encodeURIComponent(`${process.env.TMAP_KEY}`);
    console.log(url + queryParams);
    request(
        {
            url: url + queryParams,
            method: 'GET'
        },
        function(error, res, body){
            console.log(res.searchPoiInfo);
        }
    );
    res.status(200).send('Poi success');
});

module.exports = router;