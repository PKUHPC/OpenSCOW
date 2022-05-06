import { FastifyReply } from "fastify";
import fp from "fastify-plugin";

export type ErrorType<T extends Error> = new (...args: any[]) => T;

export type ErrorHandler<T extends Error> = (t: T, rep: FastifyReply) => void;

export const ErrorPluginName = "ErrorPlugin";

declare module "fastify" {
  interface FastifyInstance {
    registerErrorHandler: <T extends Error>(type: ErrorType<T>, handler: ErrorHandler<T>) => void;
  }
}

export const errorPlugin = fp(async (fastify) => {
  const map: [ErrorType<Error>, ErrorHandler<Error>][] = [];

  fastify.decorate("registerErrorHandler", <T extends Error>(type: ErrorType<T>, handler: ErrorHandler<T>) => {
    map.push([type, handler as ErrorHandler<Error>]);
  });

  fastify.setErrorHandler((err, req, rep) => {
    for (const [type, handler] of map) {
      if (err instanceof type) {
        handler(err, rep);
        return;
      }
    }
    req.log.error(`No specific error handler for ${err} is found.`);
    req.log.error(err);
    rep.send(err);
  });
}, { name: ErrorPluginName });

