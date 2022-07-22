import { route as rawRoute } from "@ddadaal/next-typed-api-routes-runtime";
import pinoHttp from "pino-http";

const httpLogger = pinoHttp();

export const route: typeof rawRoute = (schemaName, handler) => {
  return rawRoute(schemaName, async (req, res) => {
    httpLogger(req, res);
    return handler(req, res);
  });
};
