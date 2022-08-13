var express = require('express');
var router = express.Router();
const db = require('../models/db');

router.post('/login', async (req, res) =>{
    const [result]  = await db.login(req.body.email, req.body.password);
    if(result && result.email){
        req.session.islogined = true;
        req.session.email = result.email;
        res.cookie('login', 'logined', {

        })
        res.status(200).send('login success');
    }
    else{
        res.status(401).send('login fail');
    }
})

module.exports = router;