import { jsonFetch, route } from "@ddadaal/next-typed-api-routes-runtime";
import path from "path";
import { getTokenFromCookie } from "src/auth/cookie";
import { runtimeConfig } from "src/utils/config";

export interface LogoutSchema {
  method: "DELETE";

  responses: {
    204: null;
  }
}

interface AuthLogoutSchema {
    query: { token: string },
    responses: { 204: null }
}

export default route<LogoutSchema>("LogoutSchema", async (req) => {

  const token = getTokenFromCookie({ req });

  if (token) {
    return await jsonFetch<AuthLogoutSchema>({
      method: "DELETE",
      path: path.join(runtimeConfig.AUTH_INTERNAL_URL, "/token"),
      query: { token },
    })
      .then(() => ({ 204: null }));
  } else {
    return { 204: null };
  }

});
