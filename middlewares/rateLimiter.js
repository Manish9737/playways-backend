const rateLimit = require("express-rate-limit");
const redis = require("../config/redis");
const { ipKeyGenerator } = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => ipKeyGenerator(req),

  handler: async (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests, slow down and try again later",
    });
  },

  store: {
    async increment(key) {
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, 60 * 15);
      }

      return {
        totalHits: count,
        resetTime: new Date(Date.now() + 15 * 60 * 1000),
      };
    },

    async decrement(key) {
      await redis.decr(key);
    },

    async resetKey(key) {
      await redis.del(key);
    },
  },
});

module.exports = limiter;
