import fp from "fastify-plugin";
import Redis from "ioredis";
import { config } from "src/config";

export interface UserInfo {
  identityId: string;
}

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

export const redisPlugin = fp(async (f) => {

  const redis = new Redis(config.REDIS_URL);

  f.decorate("redis", redis);

  f.addHook("onClose", async () => {
    redis.disconnect();
  });

});
