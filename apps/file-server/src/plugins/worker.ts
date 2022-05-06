import { exec, ExecException } from "child_process";
import { FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { quote } from "shell-quote";
import { getgid, getuid } from "src/utils/userid";

export const WORKER_MARKER = "worker";

export type Command = {
  readable: [path: string],
  delete: [path: string],
  move: [fromPath: string, toPath: string],
  mkdir: [path: string],
  createFile: [path: string],
  copy: [fromPath: string, toPath: string],
  ls: [path: string],
};

declare module "fastify" {
  interface FastifyRequest {
    runWorkerAsCurrentUser: <T extends keyof Command>(cmd: T, ...args: Command[T]) => Promise<{
      err: ExecException | null; stdout: string; stderr: string }>;
  }
}

export const workerPlugin = fp(async (f) => {

  f.decorateRequest<FastifyRequest["runWorkerAsCurrentUser"]>("runWorkerAsCurrentUser",
    function(...args) {
      const log = this.log;

      const { identityId } = this.user;

      const testing = process.env.NODE_ENV === "test";

      return new Promise(async (res) => {
      // get uid and gid from identityId
        const [uid, gid] = await Promise.all([
          getuid(identityId),
          getgid(identityId),
        ]);

        log.info("Run worker uid %d gid %d args %o", uid, gid, args);

        const cmd = quote([
          ...testing ? ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/index.ts"] : process.argv,
          WORKER_MARKER,
          ...args,
        ]);

        exec(cmd, {
          gid, uid, cwd: process.cwd(),
        }, (err, stdout, stderr) => {
          log.info("Cmd %o completed. err %o, stdout %s, stderr %s", cmd, err, stdout, stderr);
          res({ err, stderr, stdout });
        });
      });


    },
  );

});
