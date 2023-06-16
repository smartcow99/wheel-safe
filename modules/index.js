const router = require('express').Router();

const usersRouter = require('./users/users.router');
const mapsRouter = require('./maps/maps.router');
const helpsRouter = require('./helps/helps.router');

router.use('/', usersRouter);
router.use('/map', mapsRouter);
router.use('/helps', helpsRouter);

module.exports = router;
