import fp from "fastify-plugin";
import { AuthProvider } from "src/auth/AuthProvider";
import { createLdapAuthProvider } from "src/auth/ldap";

declare module "fastify" {
  interface FastifyInstance {
    auth: AuthProvider;
  }
}


export const authPlugin = fp(async (f) => {

  f.decorate("auth", createLdapAuthProvider(f));
});
