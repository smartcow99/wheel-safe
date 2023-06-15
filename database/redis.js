const { createClient } = require('redis');
const CustomError = require('../utils/CustomError');

/**
 * Node-Redis
 * https://github.com/redis/node-redis
 *
 * Redis commands
 * https://redis.io/commands/
 */
const config = {
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  database: parseInt(process.env.REDIS_DB_INDEX) || 3,
};
if (process.env.REDIS_PASS) config.password = process.env.REDIS_PASS;

const client = createClient(config);

client.on('error', err => {
  console.error('Redis client error', err);
  throw new CustomError('REDIS_FAILED', 500);
});
client.connect();

module.exports = client;
