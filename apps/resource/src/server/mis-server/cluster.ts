import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { ClusterConfigSchema } from "@scow/config/build/cluster";
import { Cluster, ClusterActivationStatus } from "@scow/config/build/type";
import { getClusterConfigsTypeFormat } from "@scow/lib-web/build/utils/typeConversion";
import { ConfigServiceClient as CommonConfigClient } from "@scow/protos/build/common/config";
import { ConfigServiceClient } from "@scow/protos/build/server/config";
import { GetClusterConfigFilesResponse } from "@scow/protos/generated/common/config";
import { USE_MOCK } from "src/utils/processEnv";
import { getScowClient } from "src/utils/scowClient";

import { authenticate } from "../auth/server";
import { CLUSTER_CONFIGS_DATA, MOCK_ACTIVATED_CLUSTER_INFO } from "../trpc/route/mock";

// 获取集群配置文件中的信息
export async function getScowClusterConfigs(): Promise<GetClusterConfigFilesResponse> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    return CLUSTER_CONFIGS_DATA;
  }

  const resp = authenticate();

  if (!resp) {
    throw new Error("Can not Access to SCOW mis-server.");
  }

  const commonConfigClient = getScowClient(CommonConfigClient);

  const clusterConfigFilesInfo = await asyncClientCall(commonConfigClient, "getClusterConfigFiles", {});
  if (!clusterConfigFilesInfo || clusterConfigFilesInfo.clusterConfigs.length === 0) {
    throw new Error("Can not find cluster config files.");
  }

  return clusterConfigFilesInfo;

}


// 获取当前在线集群
export async function getScowActivatedClusters(): Promise<Cluster[]> {

  if (process.env.NODE_ENV === "test" || USE_MOCK) {
    return MOCK_ACTIVATED_CLUSTER_INFO;
  }

  const clusterConfigFilesInfo = await getScowClusterConfigs();
  if (!clusterConfigFilesInfo) {
    throw new Error("Can not Access to SCOW mis-server.");
  }

  const modifiedClustersInfo: Record<string, ClusterConfigSchema>
   = getClusterConfigsTypeFormat(clusterConfigFilesInfo.clusterConfigs);

  const serverConfigClient = getScowClient(ConfigServiceClient);
  const clustersRuntimeInfo = await asyncClientCall(serverConfigClient, "getClustersRuntimeInfo", {});
  const activatedRuntimeInfo = clustersRuntimeInfo.results.
    filter((x) => x.activationStatus === ClusterActivationStatus.ACTIVATED);
  const activatedClusters: Cluster[] = activatedRuntimeInfo.map((item) => {

    return { id: item.clusterId, name: modifiedClustersInfo[item.clusterId].displayName };
  });

  return activatedClusters;
}


