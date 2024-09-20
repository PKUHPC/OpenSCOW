import { trpc } from "src/server/trpc/def";
import { withAuthContext } from "src/server/trpc/middleware/with-auth-context";
import { withLoggerContext } from "src/server/trpc/middleware/with-logger-context";

export const baseProcedure = trpc.procedure;

export const authProcedure = baseProcedure.use(withLoggerContext).use(withAuthContext);
