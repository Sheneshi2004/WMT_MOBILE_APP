// Redis configuration (Optional - for production caching)
// Install: npm install redis

/*
const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log('Redis Connected');
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  }
};

const getCache = async (key) => {
  if (!redisClient) return null;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, data, ttl = 3600) => {
  if (!redisClient) return;
  await redisClient.setEx(key, ttl, JSON.stringify(data));
};

const deleteCache = async (key) => {
  if (!redisClient) return;
  await redisClient.del(key);
};

module.exports = { connectRedis, getCache, setCache, deleteCache, redisClient };
*/

// Simple fallback when Redis not available
module.exports = {
  connectRedis: async () => console.log('Redis not configured, using fallback'),
  getCache: async () => null,
  setCache: async () => { },
  deleteCache: async () => { },
  redisClient: null
};