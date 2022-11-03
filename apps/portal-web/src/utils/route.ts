import { route as rawRoute } from "@ddadaal/next-typed-api-routes-runtime";

export const route: typeof rawRoute = (schemaName, handler) => {
  return rawRoute(schemaName, async (req, res) => {
    return handler(req, res);
  });
};
