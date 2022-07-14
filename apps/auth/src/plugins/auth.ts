import fp from "fastify-plugin";
import { AuthProvider } from "src/auth/AuthProvider";
import { createLdapAuthProvider } from "src/auth/ldap";
import { config } from "src/config/env";

declare module "fastify" {
  interface FastifyInstance {
    auth: AuthProvider;
  }
}

const providers = {
  "ldap": createLdapAuthProvider,
} as const;

export const authPlugin = fp(async (f) => {

  const provider = providers[config.AUTH_TYPE];

  if (!provider) { throw new Error("Unknown auth type " + config.AUTH_TYPE);}

  f.decorate("auth", provider(f));
});
