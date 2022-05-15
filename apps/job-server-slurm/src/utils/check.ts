import { ServiceError, status } from "@grpc/grpc-js";
import { clustersConfig } from "src/config";

export function checkClusterExistence(cluster: string) {
  if (!clustersConfig[cluster]) {
    throw <ServiceError> {
      code: status.NOT_FOUND,
      message: `Cluster ${cluster} is not found.`,
    };
  }
}
