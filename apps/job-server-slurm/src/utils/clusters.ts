import { ServiceError, status } from "@grpc/grpc-js";
import { getConfigFromFile } from "@scow/config";
import { clustersConfig as clustersConfigInfo } from "@scow/config/build/appConfig/clusters";

export const clustersConfig = getConfigFromFile(clustersConfigInfo.schema, clustersConfigInfo.name, false);

export function checkClusterExistence(cluster: string) {
  if (!clustersConfig[cluster]) {
    throw <ServiceError> {
      code: status.NOT_FOUND,
      message: `Cluster ${cluster} is not found.`,
    };
  }
}
