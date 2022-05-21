import { createReqIdGen, Logger, plugin } from "@ddadaal/tsgrpc-server";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { ChannelCredentials, Client, ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { config } from "src/config/env";

type ClientConstructor<TClient> =
  new (address: string, credentials: ChannelCredentials) => TClient;

function getClient<TClient extends Client>(
  ctor: ClientConstructor<TClient>,
  address: string,
): TClient {
  return new ctor(
    address,
    ChannelCredentials.createInsecure(),
  );
}

declare type First<T extends any[]> = T extends [infer I, ...infer _L] ? I : never;
type Last<T extends any[]> = T extends [...infer _I, infer L] ? L : never;
declare type ClientCallCallback<TReply> = (error: ServiceError | null, response: TReply) => void;
declare type ClientCall<TReq, TReply> = (req: TReq, callback: ClientCallCallback<TReply>) => unknown;
declare type TRequest<TFunc> = TFunc extends ClientCall<any, any> ? First<Parameters<TFunc>> : never;
type TRes<TFunc> =
  TFunc extends ClientCall<any, any>
    ? Last<Parameters<TFunc>> extends ((...args: any) => any)
      ? Last<Parameters<Last<Parameters<TFunc>>>>
      : never
    : never

// Throw ServiceError if failed.
type CallOnAll = <TClient extends Client, TForwardKey extends keyof TClient, TRevertKey extends keyof TClient>(
  clientCtor: ClientConstructor<TClient>,
  execute: { method: TForwardKey, req: TRequest<TClient[TForwardKey]> },
  undo?: { method: TRevertKey, req: TRequest<TClient[TRevertKey]> }
) => Promise<void>;

type CallOnOne = <TClient extends Client, TKey extends keyof TClient>(
  cluster: string,
  clientCtor: ClientConstructor<TClient>,
  method: TKey,
  req: TRequest<TClient[TKey]>,
) => Promise<TRes<TClient[TKey]>>;


export type ClusterPlugin = {
  clusters: {
    clusters: string[];
    callOnAll: CallOnAll;
    callOnOne: CallOnOne;
  }
}

function logSuccess(method: PropertyKey, cluster: string, logger: Logger) {
  logger.trace("Execute %s on %s successfully.", method, cluster);
}

function logFailure(method: PropertyKey, cluster: string, e: ServiceError, logger: Logger) {
  logger.error("Failed to execute %s on %s.", method, cluster);
  logger.error(e);
}


/**
 * Create a clustersPlugin.
 * @param clusters cluster id and manager addr. format: id=addr,ip=addr
 * @returns
 */
export const clustersPlugin = plugin(async (f) => {

  const logger = f.logger.child({ plugin: "clusters" });

  const clusters = config.CLUSTERS.split(",").filter((x) => x)
    .reduce((prev, curr) => {
      const [name, addr] = curr.split("=");
      prev[name] = addr;
      return prev;
    }, {} as Record<string, string>);

  logger.info("Clusters: ");
  Object.entries(clusters).forEach(([name, addr]) => {
    logger.info(`Name: ${name}. Addr: ${addr}`);
  });

  const genId = createReqIdGen();


  const clustersPlugin = {

    clusters: Object.keys(clusters),

    callOnOne: <CallOnOne>(async (cluster, ctor, method, req) => {

      const addr = clusters[cluster];

      if (!addr) {
        throw <ServiceError>{ code: Status.NOT_FOUND, message: `Cluster ${cluster} is not found.` };
      }

      const clusterOpId = genId();

      const subLogger = logger.child({ clusterOpId });

      logger.trace(`Executing ${method} on cluster ${cluster}. req: ${JSON.stringify(req)}`);

      return await asyncClientCall(getClient(ctor, addr), method, req)
        .then((v) => {
          logSuccess(method, cluster, subLogger);
          return v;
        }).catch((e) => {
          logFailure(method, cluster, e, subLogger);
          throw e;
        });
    }),

    // throws error if failed.
    callOnAll: <CallOnAll>(async (clientCtor, execute, undo) => {

      const clusterOpId = genId();

      const subLogger = logger.child({ clusterOpId });

      const results = await Promise.all(Object.entries(clusters).map(async ([name, addr]) => {
        subLogger.trace(`Executing ${execute.method} on all clusters. req: ${JSON.stringify(execute.req)}`);

        return await asyncClientCall(getClient(clientCtor, addr), execute.method, execute.req)
          .then(() => {
            logSuccess(execute.method, name, subLogger);
            return [name, addr];
          })
          .catch((e: ServiceError) => {
            logFailure(execute.method, name, e, subLogger);
            return undefined;
          });
      }));

      const successfulCluster = results.filter((x) => x !== undefined) as [string, string][];

      // if not all cluster succeeds, revert changes
      if (successfulCluster.length < Object.keys(clusters).length) {
        if (undo) {
          subLogger.warn(`
          Undo ${execute.method} on previously successful clusters
          ${successfulCluster.map(([name]) => name).join(",")}
        `);

          subLogger.warn(`Undo method ${undo.method}, req: ${JSON.stringify(undo.req)}`);

          const results = await Promise.all(successfulCluster
            .map(async ([name, addr]) => {
              return await asyncClientCall(getClient(clientCtor, addr), undo.method, undo.req)
                .then(() => {
                  logSuccess(undo.method, name, subLogger);
                  return undefined;
                })
                .catch((e: ServiceError) => {
                  logFailure(undo.method, name, e, subLogger);
                  return name;
                });
            }));

          const failedClusters = results.filter((x) => typeof x === "string") as string[];

          if (failedClusters.length > 0) {
            subLogger.error(`Failed to undo ${execute.method} on ${failedClusters.join(",")}.`);
          }
        } else {
          subLogger.warn(`
            ${execute.method} only succeeds on clusters
            ${successfulCluster.map(([name]) => name).join(",")}
        `);
        }

        throw <ServiceError>{
          code: Status.INTERNAL,
          message: "Executions on clusters failed.",
        };
      }
    }),
  };

  f.addExtension("clusters", clustersPlugin);
});
