import { FastifyInstance } from "fastify";
import { AuthProvider } from "src/auth/AuthProvider";
import { serveLoginHtml } from "src/auth/loginHtml";
import { registerPostHandler } from "src/auth/ssh/postHandler";
import { authConfig } from "src/config/auth";
import { ensureNotUndefined } from "src/utils/validations";

export const createSshAuthProvider = (f: FastifyInstance) => {

  const { ssh } = ensureNotUndefined(authConfig, ["ssh"]);

  registerPostHandler(f, ssh);

  return <AuthProvider>{
    serveLoginHtml: (callbackUrl, req, rep) => serveLoginHtml(false, callbackUrl, req, rep),
    fetchAuthTokenInfo: async () => undefined,
    validateName: undefined,
    createUser: undefined,
    changePassword: undefined,
  };

};
