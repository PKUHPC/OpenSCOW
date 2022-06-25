import { Server } from "@ddadaal/tsgrpc-server";
import { config } from "src/config/env";
import { plugins } from "src/plugins";
import { accountServiceServer } from "src/services/account";
import { adminServiceServer } from "src/services/admin";
import { chargingServiceServer } from "src/services/charging";
import { initServiceServer } from "src/services/init";
import { jobServiceServer } from "src/services/job";
import { jobChargeLimitServer } from "src/services/jobChargeLimit";
import { tenantServiceServer } from "src/services/tenant";
import { userServiceServer } from "src/services/user";

export async function createServer() {

  const server = new Server({
    host: config.HOST,
    port: config.PORT,
    logger: { level: config.LOG_LEVEL },
  });

  for (const plugin of plugins) {
    await server.register(plugin);
  }
  await server.register(accountServiceServer);
  await server.register(userServiceServer);
  await server.register(adminServiceServer);
  await server.register(initServiceServer);
  await server.register(jobChargeLimitServer);
  await server.register(jobServiceServer);
  await server.register(chargingServiceServer);
  await server.register(tenantServiceServer);

  return server;
}
