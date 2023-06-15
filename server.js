require('dotenv').config();

const app = require('./config/express');
const redis = require('./database/redis');

app.set('port', process.env.PORT || 3000);
let isDisableKeepAlive = false;
app.use((req, res, next) => {
  if (isDisableKeepAlive) {
    res.set('Connection', 'close');
  }
  next();
});

app.use(async (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  const status = err?.status || 500;
  const message = err?.message || 'INTERNAL_SERVER_ERROR';
  return res.status(status).json({ message });
});

const server = app.listen(app.get('port'), () => {
  process.send('ready');
  console.log(`Server started on port ${app.get('port')}`);
});

server.setTimeout(50000);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at: ', promise, '\nReason:', reason);
});

process.on('SIGINT', () => {
  isDisableKeepAlive = true;
  server.close(() => {
    console.log('Server closed');
    redis.quit();
    process.exit(0);
  });
});

module.exports = server;
