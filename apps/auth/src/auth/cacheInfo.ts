import { randomUUID } from "crypto";
import { FastifyRequest } from "fastify";
import { authConfig } from "src/config/auth";
import { config } from "src/config/env";

const testUsers: Record<string, string> = config.TEST_USERS.split(",").reduce((prev, curr) => {
  const [from, to] = curr.split("=");
  if (from && to) {
    prev[from.trim()] = to.trim();
  }
  return prev;
}, {});

/**
 * 生成一个UUID，将此UUID以及对应的用户identityId保存到redis中，并返回token
 */
export async function cacheInfo(identityId: string, req: FastifyRequest): Promise<string> {
  if (testUsers[identityId]) {
    req.log.info("Rewrite test user %s to user %s", identityId, testUsers[identityId]);
    identityId = testUsers[identityId];
  }

  const token = randomUUID();

  await req.server.redis.set(token,
    identityId, "EX", authConfig.tokenTimeoutSeconds,
  );

  return token;

}
