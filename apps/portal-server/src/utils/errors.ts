import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";

export const clusterNotFound = (cluster: string) => {
  return <ServiceError> { code: Status.NOT_FOUND, message: `cluster ${cluster} is not found` };
};

export const jobNotFound = (jobId: number) => {
  return <ServiceError> { code: Status.NOT_FOUND, message: `job id ${jobId} is not found` };
};
