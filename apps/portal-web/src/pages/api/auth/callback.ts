import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { setTokenCookie } from "src/auth/cookie";
import { validateToken } from "src/auth/token";

export interface AuthCallbackSchema {
  method: "GET";

  query: {
    token: string;
  }

  responses: {
    200: null;
    /** the token is invalid */
    403: null;
  }
}


export default route<AuthCallbackSchema>("AuthCallbackSchema", async (req, res) => {

  const { token } = req.query;

  if (await validateToken(token)) {
    // set token cache
    setTokenCookie({ res }, token);
    res.redirect(process.env.NEXT_PUBLIC_BASE_PATH || "/");
  } else {
    return { 403: null };

  }

});
