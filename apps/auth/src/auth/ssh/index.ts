import { FastifyInstance } from "fastify";
import { AuthProvider } from "src/auth/AuthProvider";
import { serveLoginHtml } from "src/auth/loginHtml";
import { registerPostHandler } from "src/auth/ssh/postHandler";

export const createSshAuthProvider = (f: FastifyInstance) => {

  registerPostHandler(f);

  return <AuthProvider>{
    serveLoginHtml: (callbackUrl, req, rep) => serveLoginHtml(false, callbackUrl, req, rep),
    fetchAuthTokenInfo: async () => undefined,
    validateName: undefined,
    createUser: undefined,
    changePassword: undefined,
  };

};
