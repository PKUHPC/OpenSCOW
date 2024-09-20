import { auth } from "src/server/trpc/route/auth";

import { trpc } from "./def";
import { config } from "./route/config";
import { misServerRouter } from "./route/mis-server";
import { partitionRouter } from "./route/partitions";

export const appRouter = trpc.router({
  auth,
  config,
  partitions: partitionRouter,
  misServer: misServerRouter,
});

export type AppRouter = typeof appRouter;

export type Caller = ReturnType<typeof appRouter.createCaller>;
