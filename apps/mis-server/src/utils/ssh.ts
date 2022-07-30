import { Logger } from "@ddadaal/tsgrpc-server";
import { insertKey as libInsertKey } from "@scow/lib-ssh";
import fs from "fs";
import { clusters } from "src/config/clusters";
import { privateKeyPath, publicKeyPath } from "src/config/mis";

const publicKey = fs.readFileSync(publicKeyPath, "utf-8").trim();

const clusterLoginNodes = Object.keys(clusters).map((cluster) => {
  const clusterInfo = clusters[cluster];
  return { host: clusterInfo.slurm.loginNodes[0], name: clusterInfo.displayName };
});

export async function insertKey(user: string, logger: Logger) {
  await libInsertKey(user, clusterLoginNodes, privateKeyPath, publicKey, logger);
}

