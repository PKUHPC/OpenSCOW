import { validateToken } from "@scow/lib-auth";
import { FastifyInstance } from "fastify";
import { config } from "src/config";

export interface UserInfo {
  // only cares about identityId
  identityId: string;
}

export const registerAuth = (f: FastifyInstance) => {
  f.io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    // query the token in the auth

    validateToken(config.AUTH_URL, token)
      .then((result) => {
        if (result) {
          socket.data = { identityId: result.identityId };
          next();
        } else {
          next(new Error("No or invalid user token"));
        }
      })
      .catch((e) => {
        next(new Error("Error connecting to auth", { cause: e }));
      });
  });
};
